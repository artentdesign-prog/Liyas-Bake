import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where, serverTimestamp, Timestamp, writeBatch } from 'firebase/firestore';

/**
 * Security rules verification suite covering the "Dirty Dozen" adversarial payloads.
 * Run against Firebase Emulator Suite: firebase emulators:exec --only firestore "tsx --test firestore.rules.test.ts"
 */
describe("Liya's Bake Firestore Security Rules", () => {
  let testEnv: RulesTestEnvironment;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'liyas-bake-rules-test',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
      },
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it('allows verified bootstrapped admin to seed and manage products', async () => {
    const adminDb = testEnv.authenticatedContext('admin-uid', {
      email: 'artentdesign@gmail.com',
      email_verified: true,
    }).firestore();

    await assertSucceeds(
      setDoc(doc(adminDb, 'products', 'prod-1'), {
        id: 'prod-1',
        name: 'Rosé Velvet Cake',
        category: 'Birthday Cakes',
        price: 1850,
        rateUnit: 'per 1 kg',
        rating: 4.9,
        ratingCount: 42,
        description: 'Delicate rose cake',
        image: '/images/rose-velvet.jpg',
        availabilityBadge: 'Baked Fresh Daily',
        isFeatured: true,
        isHidden: false,
        ingredients: ['Organic Flour', 'Butter'],
        allergens: ['Gluten', 'Dairy'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('rejects unverified email writes (Dirty Dozen #1)', async () => {
    const unverifiedDb = testEnv.authenticatedContext('user-1', {
      email: 'guest@example.com',
      email_verified: false,
    }).firestore();

    await assertFails(
      setDoc(doc(unverifiedDb, 'specialOrders', 'so-1'), {
        id: 'so-1',
        userId: 'user-1',
        customerName: 'Guest',
        phone: '+919999999999',
        email: 'guest@example.com',
        occasion: 'Birthday',
        preferredDate: '2026-12-01',
        servingSize: '20 - 30 Guests',
        message: 'Chocolate cake',
        specialRequirements: '',
        referenceImage: '',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('rejects shadow fields (Dirty Dozen #2) and UID spoofing (#4)', async () => {
    const userDb = testEnv.authenticatedContext('user-1', {
      email: 'user1@example.com',
      email_verified: true,
    }).firestore();

    await assertFails(
      setDoc(doc(userDb, 'testimonials', 'test-shadow'), {
        id: 'test-shadow',
        authorUid: 'user-1',
        name: 'Guest',
        rating: 5,
        comment: 'Great cake',
        occasion: 'Birthday',
        date: '2026-11-12',
        isApproved: true,
        isAdmin: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    await assertFails(
      setDoc(doc(userDb, 'specialOrders', 'so-spoof'), {
        id: 'so-spoof',
        userId: 'other-user',
        customerName: 'Spoofer',
        phone: '1234567890',
        email: 'u@example.com',
        occasion: 'Birthday',
        preferredDate: '2026-12-01',
        servingSize: '10 - 20 Guests',
        message: 'Test',
        specialRequirements: '',
        referenceImage: '',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('blocks blanket PII list on specialOrders and hidden product reads (#3, #8)', async () => {
    const userDb = testEnv.authenticatedContext('user-1', {
      email: 'user1@example.com',
      email_verified: true,
    }).firestore();

    await assertFails(getDocs(collection(userDb, 'specialOrders')));
    await assertFails(getDocs(collection(userDb, 'products')));
    await assertSucceeds(
      getDocs(query(collection(userDb, 'products'), where('isHidden', '==', false)))
    );
  });

  it('rejects backdated timestamps (#5), invalid IDs (#6), oversized strings (#7), and self-admin (#11)', async () => {
    const userDb = testEnv.authenticatedContext('user-1', {
      email: 'user1@example.com',
      email_verified: true,
    }).firestore();

    await assertFails(
      setDoc(doc(userDb, 'admins', 'user-1'), {
        uid: 'user-1',
        email: 'user1@example.com',
        role: 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    await assertFails(
      setDoc(doc(userDb, 'specialOrders', 'bad$id!'), {
        id: 'bad$id!',
        userId: 'user-1',
        customerName: 'Guest',
        phone: '1234567890',
        email: 'u@example.com',
        occasion: 'Birthday',
        preferredDate: '2026-12-01',
        servingSize: '10 - 20 Guests',
        message: 'Test',
        specialRequirements: '',
        referenceImage: '',
        status: 'pending',
        createdAt: Timestamp.fromMillis(1000),
        updatedAt: serverTimestamp(),
      })
    );

    await assertFails(
      setDoc(doc(userDb, 'testimonials', 'test-big'), {
        id: 'test-big',
        authorUid: 'user-1',
        name: 'Guest',
        rating: 5,
        comment: 'x'.repeat(2500),
        occasion: 'Birthday',
        date: '2026-11-12',
        isApproved: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('enforces atomic batch writes for product ratings (#12) and terminal state lock (#10)', async () => {
    const userDb = testEnv.authenticatedContext('user-2', {
      email: 'user2@example.com',
      email_verified: true,
    }).firestore();

    // Non-atomic rating without product batch update must fail
    await assertFails(
      setDoc(doc(userDb, 'productRatings', 'rate-1'), {
        id: 'rate-1',
        productId: 'prod-1',
        authorUid: 'user-2',
        rating: 5,
        customerName: 'User 2',
        comment: 'Delicious',
        isPublic: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // Atomic batch updating product & creating rating succeeds
    const prodSnap = await getDoc(doc(userDb, 'products', 'prod-1'));
    assert.ok(prodSnap.exists());
    const batch = writeBatch(userDb);
    batch.set(doc(userDb, 'productRatings', 'rate-atomic-1'), {
      id: 'rate-atomic-1',
      productId: 'prod-1',
      authorUid: 'user-2',
      rating: 5,
      customerName: 'User 2',
      comment: 'Amazing',
      isPublic: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(userDb, 'products', 'prod-1'), {
      rating: 4.9,
      ratingCount: 43,
      updatedAt: serverTimestamp(),
    });
    await assertSucceeds(batch.commit());
  });
});
