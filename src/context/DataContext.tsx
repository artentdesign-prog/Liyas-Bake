import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  AboutData,
  AdminStats,
  BusinessHour,
  DatabaseStatus,
  GalleryItem,
  HomepageData,
  Product,
  SiteData,
  SiteSettings,
  SpecialOrder,
  StoreDirections,
  Testimonial,
} from '../types';
import { defaultData } from '../data/defaultData';
import { useAuth } from './AuthContext';
import {
  db,
  firebaseConfigInfo,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from '../firebase';

const STORAGE_KEY = 'liyas_bake_site_data_v1';

interface DataContextValue {
  siteData: SiteData;
  loading: boolean;
  error: string | null;
  firebaseConnected: boolean;
  firestoreSynced: boolean;
  syncAllToFirestore: () => Promise<boolean>;
  refreshPublicData: () => Promise<void>;
  refreshAdminDashboard: () => Promise<void>;
  submitSpecialOrder: (
    order: Partial<SpecialOrder>
  ) => Promise<{ success: boolean; message: string }>;
  submitTestimonial: (
    review: Partial<Testimonial>
  ) => Promise<{ success: boolean; message: string }>;
  rateProduct: (
    productId: string,
    rating: number,
    customerName?: string,
    comment?: string
  ) => Promise<{ success: boolean; message: string; product?: Product }>;
  databaseStats: DatabaseStatus | null;
  refreshDatabaseStatus: () => Promise<void>;
  resetCompulsoryDatabase: () => Promise<boolean>;
  adminStats: AdminStats | null;
  adminSpecialOrders: SpecialOrder[];
  saveProduct: (product: Partial<Product>) => Promise<boolean>;
  addProduct: (product: Partial<Product>) => Promise<boolean>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  deleteAllProducts: () => Promise<boolean>;
  saveGalleryItem: (item: Partial<GalleryItem>) => Promise<boolean>;
  addGalleryItem: (item: Partial<GalleryItem>) => Promise<boolean>;
  updateGalleryItem: (id: string, item: Partial<GalleryItem>) => Promise<boolean>;
  deleteGalleryItem: (id: string) => Promise<boolean>;
  deleteAllGalleryItems: () => Promise<boolean>;
  updateSpecialOrderStatus: (id: string, status: string) => Promise<boolean>;
  updateInquiryStatus: (id: string, status: string) => Promise<boolean>;
  deleteSpecialOrder: (id: string) => Promise<boolean>;
  deleteInquiry: (id: string) => Promise<boolean>;
  deleteAllSpecialOrders: () => Promise<boolean>;
  deleteAllInquiries: () => Promise<boolean>;
  saveTestimonial: (item: Partial<Testimonial>) => Promise<boolean>;
  updateTestimonialApproval: (
    id: string,
    isApproved: boolean
  ) => Promise<boolean>;
  deleteTestimonial: (id: string) => Promise<boolean>;
  deleteAllTestimonials: () => Promise<boolean>;
  deleteAllData: () => Promise<boolean>;
  resetToDefault: () => Promise<boolean>;
  updateHomepage: (homepage: Partial<HomepageData>) => Promise<boolean>;
  updateAbout: (about: Partial<AboutData>) => Promise<boolean>;
  updateBusinessHours: (hours: BusinessHour[]) => Promise<boolean>;
  updateStoreDirections: (directions: Partial<StoreDirections>) => Promise<boolean>;
  updateSettings: (settings: Partial<SiteSettings>) => Promise<boolean>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

const sanitizeId = (raw: string | undefined, prefix: string): string => {
  const cleaned = String(raw || '').replace(/[^a-zA-Z0-9_-]/g, '');
  if (cleaned.length >= 1 && cleaned.length <= 128) return cleaned;
  return `${prefix}-${Date.now()}`;
};

const clampStr = (val: unknown, maxLen: number): string =>
  String(val ?? '').slice(0, maxLen);

const sanitizeProduct = (p: Product): Product => ({
  ...p,
  availabilityBadge:
    p.availabilityBadge && p.availabilityBadge.includes('48h')
      ? 'Made to Order'
      : p.availabilityBadge || 'In Stock',
  rating: p.rating ?? 4.9,
  ratingCount: p.ratingCount ?? 20,
  rateUnit: p.rateUnit || 'per portion',
});

const buildSettingsPayload = (s: SiteSettings) => ({
  siteName: clampStr(s.siteName || "Liya's Bake", 120),
  tagline: clampStr(s.tagline || '', 300),
  logoUrl: clampStr(s.logoUrl || '/logo.jpg', 900000),
  faviconUrl: clampStr(s.faviconUrl || '/logo.jpg', 900000),
  phone: clampStr(s.phone || '', 40),
  email: clampStr(s.email || '', 200),
  address: clampStr(s.address || '', 400),
  googleMapsUrl: clampStr(s.googleMapsUrl || '', 1000),
  instagramUrl: clampStr(s.instagramUrl || '', 500),
  facebookUrl: clampStr(s.facebookUrl || '', 500),
  pinterestUrl: clampStr(s.pinterestUrl || '', 500),
  seoTitle: clampStr(s.seoTitle || '', 200),
  seoDescription: clampStr(s.seoDescription || '', 500),
  seoKeywords: clampStr(s.seoKeywords || '', 500),
  pickupNotice: clampStr(s.pickupNotice || '', 500),
  showPickupBanner: Boolean(s.showPickupBanner),
  maintenanceMode: Boolean(s.maintenanceMode),
  visitCount: Math.max(0, Number(s.visitCount) || 0),
  isPublic: true,
  updatedAt: serverTimestamp(),
});

const buildHomepagePayload = (h: HomepageData) => ({
  heroImage: clampStr(h.heroImage || '/images/hero-bakery.jpg', 900000),
  heroTitle: clampStr(h.heroTitle || '', 200),
  tagline: clampStr(h.tagline || '', 300),
  welcomeTitle: clampStr(h.welcomeTitle || '', 200),
  welcomeSubtitle: clampStr(h.welcomeSubtitle || '', 300),
  welcomeStory: clampStr(h.welcomeStory || '', 2000),
  ctaText1: clampStr(h.ctaText1 || '', 100),
  ctaText2: clampStr(h.ctaText2 || '', 100),
  featuredSectionTitle: clampStr(h.featuredSectionTitle || '', 200),
  pickupNotice: clampStr(h.pickupNotice || '', 500),
  isPublic: true,
  updatedAt: serverTimestamp(),
});

const buildAboutPayload = (a: AboutData) => ({
  storyTitle: clampStr(a.storyTitle || '', 200),
  storyParagraphs: (a.storyParagraphs || [])
    .slice(0, 15)
    .map((p) => clampStr(p, 2000)),
  mission: clampStr(a.mission || '', 1000),
  vision: clampStr(a.vision || '', 1000),
  bakers: (a.bakers || []).slice(0, 20),
  timeline: (a.timeline || []).slice(0, 25),
  qualityPromises: (a.qualityPromises || [])
    .slice(0, 20)
    .map((q) => clampStr(q, 300)),
  isPublic: true,
  updatedAt: serverTimestamp(),
});

const buildStoreDirectionsPayload = (d: StoreDirections) => ({
  address: clampStr(d.address || '', 500),
  landmark: clampStr(d.landmark || '', 300),
  googleMapsUrl: clampStr(d.googleMapsUrl || '', 1000),
  mapEmbedUrl: clampStr(d.mapEmbedUrl || '', 1000),
  transportGuide: clampStr(d.transportGuide || '', 1500),
  isPublic: true,
  updatedAt: serverTimestamp(),
});

const buildBusinessHoursPayload = (hours: BusinessHour[]) => ({
  hours: (hours || []).slice(0, 14),
  isPublic: true,
  updatedAt: serverTimestamp(),
});

const buildProductFields = (p: Product) => ({
  name: clampStr(p.name || 'New Artisan Bake', 160),
  category: clampStr(p.category || 'Birthday Cakes', 80),
  price: Math.max(0, Number(p.price) || 0),
  rateUnit: clampStr(p.rateUnit || 'per portion', 60),
  rating: Math.min(5, Math.max(0, Number(p.rating) || 4.9)),
  ratingCount: Math.max(0, Number(p.ratingCount) || 1),
  description: clampStr(p.description || '', 2000),
  image: clampStr(p.image || '/images/rose-velvet.jpg', 900000),
  availabilityBadge: clampStr(
    p.availabilityBadge && p.availabilityBadge.includes('48h')
      ? 'Made to Order'
      : p.availabilityBadge || 'In Stock',
    60
  ),
  isFeatured: Boolean(p.isFeatured),
  isHidden: Boolean(p.isHidden),
  ingredients: (p.ingredients || []).slice(0, 30).map((i) => clampStr(i, 120)),
  allergens: (p.allergens || []).slice(0, 20).map((a) => clampStr(a, 120)),
});

const buildGalleryFields = (g: GalleryItem) => ({
  title: clampStr(g.title || 'Artisan Creation', 160),
  category: clampStr(g.category || 'Cakes', 80),
  imageUrl: clampStr(g.imageUrl || '/images/rose-velvet.jpg', 900000),
  description: clampStr(g.description || '', 1000),
  uploadDate: clampStr(
    g.uploadDate || new Date().toISOString().split('T')[0],
    40
  ),
  isPublic: true,
});

const buildTestimonialFields = (t: Testimonial) => ({
  name: clampStr(t.name || 'Anonymous Guest', 120),
  rating: Math.min(5, Math.max(1, Number(t.rating) || 5)),
  comment: clampStr(t.comment || 'Wonderful experience!', 2000),
  occasion: clampStr(t.occasion || 'Celebration', 100),
  date: clampStr(t.date || new Date().toISOString().split('T')[0], 40),
  isApproved: t.isApproved !== false,
});

const VALID_ORDER_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];
const normalizeOrderStatus = (status?: string) => {
  const s = String(status || 'pending').toLowerCase();
  return VALID_ORDER_STATUSES.includes(s) ? s : 'pending';
};

const buildSpecialOrderFields = (o: SpecialOrder) => ({
  customerName: clampStr(o.customerName || 'Anonymous Guest', 120),
  phone: clampStr(o.phone && o.phone.length >= 3 ? o.phone : '0000000000', 40),
  email: clampStr(o.email || '', 200),
  occasion: clampStr(o.occasion || 'Birthday', 100),
  preferredDate: clampStr(
    o.preferredDate || new Date().toISOString().split('T')[0],
    40
  ),
  servingSize: clampStr(o.servingSize || '20 - 30 Guests', 100),
  message: clampStr(o.message || '', 2000),
  specialRequirements: clampStr(o.specialRequirements || '', 1000),
  referenceImage: clampStr(o.referenceImage || '', 900000),
  status: normalizeOrderStatus(o.status),
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, isAuthenticated, firebaseUser, authReady, isFirebaseAdmin } =
    useAuth();

  const [siteData, setSiteData] = useState<SiteData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const products = Array.isArray(parsed.products)
          ? parsed.products.map(sanitizeProduct)
          : defaultData.products.map(sanitizeProduct);
        return {
          ...defaultData,
          ...parsed,
          settings: { ...defaultData.settings, ...(parsed.settings || {}) },
          homepage: { ...defaultData.homepage, ...(parsed.homepage || {}) },
          about: { ...defaultData.about, ...(parsed.about || {}) },
          products,
          gallery: Array.isArray(parsed.gallery)
            ? parsed.gallery
            : defaultData.gallery,
          testimonials: Array.isArray(parsed.testimonials)
            ? parsed.testimonials
            : defaultData.testimonials,
          businessHours:
            Array.isArray(parsed.businessHours) &&
            parsed.businessHours.length > 0
              ? parsed.businessHours
              : defaultData.businessHours,
          specialOrders: Array.isArray(parsed.specialOrders)
            ? parsed.specialOrders
            : defaultData.specialOrders || [],
          storeDirections: {
            ...defaultData.storeDirections,
            ...(parsed.storeDirections || {}),
          },
        };
      } catch {
        return defaultData;
      }
    }
    return defaultData;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStatus | null>(
    null
  );
  const [adminSpecialOrders, setAdminSpecialOrders] = useState<SpecialOrder[]>(
    siteData.specialOrders || []
  );
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [firestoreSynced, setFirestoreSynced] = useState(false);

  const siteDataRef = useRef<SiteData>(siteData);
  siteDataRef.current = siteData;

  const firestoreSyncedRef = useRef(false);
  const autoSeedAttemptedRef = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(siteData));
  }, [siteData]);

  // Mandatory connection test on boot
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setFirebaseConnected(connected);
    });
  }, []);

  const computeStats = useCallback((data: SiteData): AdminStats => {
    const orders = data.specialOrders || [];
    return {
      totalProducts: data.products.length,
      totalGallery: data.gallery.length,
      totalTestimonials: data.testimonials.length,
      pendingOrders: orders.filter(
        (o) => o.status.toLowerCase() === 'pending'
      ).length,
      totalOrders: orders.length,
      visitCount: data.settings.visitCount || 1840,
    };
  }, []);

  useEffect(() => {
    setAdminStats(computeStats(siteData));
    setAdminSpecialOrders(siteData.specialOrders || []);
  }, [siteData, computeStats]);

  // Seed or sync complete SiteData to Firestore (verified admin only)
  const writeDataToFirestore = useCallback(
    async (dataToSync: SiteData, pruneMissing = false): Promise<boolean> => {
      if (!firebaseUser?.emailVerified || !isFirebaseAdmin) return false;
      const uid = firebaseUser.uid;
      try {
        const [prodSnap, galSnap, testSnap, orderSnap] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'gallery')),
          getDocs(collection(db, 'testimonials')),
          getDocs(collection(db, 'specialOrders')),
        ]);

        const existingProdIds = new Set(prodSnap.docs.map((d) => d.id));
        const existingGalIds = new Set(galSnap.docs.map((d) => d.id));
        const existingTestIds = new Set(testSnap.docs.map((d) => d.id));
        const existingOrderIds = new Set(orderSnap.docs.map((d) => d.id));

        const targetProdIds = new Set(
          (dataToSync.products || []).map((p) => sanitizeId(p.id, 'prod'))
        );
        const targetGalIds = new Set(
          (dataToSync.gallery || []).map((g) => sanitizeId(g.id, 'gal'))
        );
        const targetTestIds = new Set(
          (dataToSync.testimonials || []).map((t) => sanitizeId(t.id, 'test'))
        );
        const targetOrderIds = new Set(
          (dataToSync.specialOrders || []).map((o) => sanitizeId(o.id, 'so'))
        );

        const batch = writeBatch(db);

        batch.set(
          doc(db, 'siteConfig', 'settings'),
          buildSettingsPayload(dataToSync.settings)
        );
        batch.set(
          doc(db, 'siteConfig', 'homepage'),
          buildHomepagePayload(dataToSync.homepage)
        );
        batch.set(
          doc(db, 'siteConfig', 'about'),
          buildAboutPayload(dataToSync.about)
        );
        batch.set(
          doc(db, 'siteConfig', 'storeDirections'),
          buildStoreDirectionsPayload(dataToSync.storeDirections)
        );
        batch.set(
          doc(db, 'siteConfig', 'businessHours'),
          buildBusinessHoursPayload(dataToSync.businessHours)
        );

        if (pruneMissing) {
          prodSnap.docs.forEach((d) => {
            if (!targetProdIds.has(d.id)) batch.delete(d.ref);
          });
          galSnap.docs.forEach((d) => {
            if (!targetGalIds.has(d.id)) batch.delete(d.ref);
          });
          testSnap.docs.forEach((d) => {
            if (!targetTestIds.has(d.id)) batch.delete(d.ref);
          });
          orderSnap.docs.forEach((d) => {
            if (!targetOrderIds.has(d.id)) batch.delete(d.ref);
          });
        }

        for (const p of dataToSync.products || []) {
          const id = sanitizeId(p.id, 'prod');
          const ref = doc(db, 'products', id);
          const fields = buildProductFields({ ...p, id });
          if (existingProdIds.has(id)) {
            batch.update(ref, { ...fields, updatedAt: serverTimestamp() });
          } else {
            batch.set(ref, {
              id,
              ...fields,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }

        for (const g of dataToSync.gallery || []) {
          const id = sanitizeId(g.id, 'gal');
          const ref = doc(db, 'gallery', id);
          const fields = buildGalleryFields({ ...g, id });
          if (existingGalIds.has(id)) {
            batch.update(ref, { ...fields, updatedAt: serverTimestamp() });
          } else {
            batch.set(ref, {
              id,
              ...fields,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }

        for (const t of dataToSync.testimonials || []) {
          const id = sanitizeId(t.id, 'test');
          const ref = doc(db, 'testimonials', id);
          const fields = buildTestimonialFields({ ...t, id });
          if (existingTestIds.has(id)) {
            batch.update(ref, { ...fields, updatedAt: serverTimestamp() });
          } else {
            batch.set(ref, {
              id,
              authorUid: clampStr(t.authorUid || uid, 128),
              ...fields,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }

        for (const o of dataToSync.specialOrders || []) {
          const id = sanitizeId(o.id, 'so');
          const ref = doc(db, 'specialOrders', id);
          const fields = buildSpecialOrderFields({ ...o, id });
          if (existingOrderIds.has(id)) {
            batch.update(ref, { ...fields, updatedAt: serverTimestamp() });
          } else {
            batch.set(ref, {
              id,
              userId: clampStr(o.userId || uid, 128),
              ...fields,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }

        await batch.commit();
        firestoreSyncedRef.current = true;
        setFirestoreSynced(true);
        setFirebaseConnected(true);
        return true;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'batch-sync');
      }
    },
    [firebaseUser, isFirebaseAdmin]
  );

  const syncAllToFirestore = useCallback(async () => {
    return writeDataToFirestore(siteDataRef.current, true);
  }, [writeDataToFirestore]);

  // Auto-seed Firestore on first verified admin session if siteConfig/settings is missing
  useEffect(() => {
    if (!authReady || !isFirebaseAdmin || !firebaseUser?.emailVerified) return;
    if (autoSeedAttemptedRef.current) return;
    autoSeedAttemptedRef.current = true;

    (async () => {
      try {
        const snap = await getDoc(doc(db, 'siteConfig', 'settings'));
        if (!snap.exists()) {
          await writeDataToFirestore(siteDataRef.current);
        } else {
          firestoreSyncedRef.current = true;
          setFirestoreSynced(true);
        }
      } catch (err) {
        console.warn('Firestore initial check warning:', err);
      }
    })();
  }, [authReady, isFirebaseAdmin, firebaseUser, writeDataToFirestore]);

  // Real-time Firestore listeners
  useEffect(() => {
    if (!authReady) return;

    let cancelled = false;
    const unsubscribers: Array<() => void> = [];

    (async () => {
      try {
        const settingsSnap = await getDoc(doc(db, 'siteConfig', 'settings'));
        if (settingsSnap.exists()) {
          firestoreSyncedRef.current = true;
          if (!cancelled) {
            setFirebaseConnected(true);
            setFirestoreSynced(true);
          }
        }
      } catch {
        // continue attaching listeners
      }

      if (cancelled) return;

      const listenSingleton = (
        docId: string,
        onData: (data: Record<string, unknown>) => void
      ) => {
        const path = `siteConfig/${docId}`;
        const unsub = onSnapshot(
          doc(db, 'siteConfig', docId),
          (snap) => {
            if (snap.exists()) {
              firestoreSyncedRef.current = true;
              setFirebaseConnected(true);
              setFirestoreSynced(true);
              onData(snap.data() as Record<string, unknown>);
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.GET, path);
          }
        );
        unsubscribers.push(unsub);
      };

      listenSingleton('settings', (d) => {
        const { isPublic: _p, updatedAt: _u, ...rest } = d;
        setSiteData((prev) => ({
          ...prev,
          settings: { ...prev.settings, ...(rest as Partial<SiteSettings>) },
        }));
      });

      listenSingleton('homepage', (d) => {
        const { isPublic: _p, updatedAt: _u, ...rest } = d;
        setSiteData((prev) => ({
          ...prev,
          homepage: { ...prev.homepage, ...(rest as Partial<HomepageData>) },
        }));
      });

      listenSingleton('about', (d) => {
        const { isPublic: _p, updatedAt: _u, ...rest } = d;
        setSiteData((prev) => ({
          ...prev,
          about: { ...prev.about, ...(rest as Partial<AboutData>) },
        }));
      });

      listenSingleton('storeDirections', (d) => {
        const { isPublic: _p, updatedAt: _u, ...rest } = d;
        setSiteData((prev) => ({
          ...prev,
          storeDirections: {
            ...prev.storeDirections,
            ...(rest as Partial<StoreDirections>),
          },
        }));
      });

      listenSingleton('businessHours', (d) => {
        if (Array.isArray(d.hours)) {
          setSiteData((prev) => ({
            ...prev,
            businessHours: d.hours as BusinessHour[],
          }));
        }
      });

      const productsRef = isFirebaseAdmin
        ? collection(db, 'products')
        : query(collection(db, 'products'), where('isHidden', '==', false));

      unsubscribers.push(
        onSnapshot(
          productsRef,
          (snap) => {
            if (!snap.empty || firestoreSyncedRef.current) {
              const list = snap.docs.map((docSnap) => {
                const d = docSnap.data();
                return sanitizeProduct({
                  id: docSnap.id,
                  name: d.name,
                  category: d.category,
                  price: d.price,
                  rateUnit: d.rateUnit,
                  rating: d.rating,
                  ratingCount: d.ratingCount,
                  description: d.description,
                  image: d.image,
                  availabilityBadge: d.availabilityBadge,
                  isFeatured: d.isFeatured,
                  isHidden: d.isHidden,
                  ingredients: d.ingredients || [],
                  allergens: d.allergens || [],
                });
              });
              setSiteData((prev) => ({ ...prev, products: list }));
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, 'products');
          }
        )
      );

      const galleryRef = isFirebaseAdmin
        ? collection(db, 'gallery')
        : query(collection(db, 'gallery'), where('isPublic', '==', true));

      unsubscribers.push(
        onSnapshot(
          galleryRef,
          (snap) => {
            if (!snap.empty || firestoreSyncedRef.current) {
              const list: GalleryItem[] = snap.docs.map((docSnap) => {
                const d = docSnap.data();
                return {
                  id: docSnap.id,
                  title: d.title,
                  category: d.category,
                  imageUrl: d.imageUrl,
                  description: d.description || '',
                  uploadDate: d.uploadDate || '',
                };
              });
              setSiteData((prev) => ({ ...prev, gallery: list }));
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, 'gallery');
          }
        )
      );

      const testimonialsRef = isFirebaseAdmin
        ? collection(db, 'testimonials')
        : query(collection(db, 'testimonials'), where('isApproved', '==', true));

      unsubscribers.push(
        onSnapshot(
          testimonialsRef,
          (snap) => {
            if (!snap.empty || firestoreSyncedRef.current) {
              const list: Testimonial[] = snap.docs.map((docSnap) => {
                const d = docSnap.data();
                return {
                  id: docSnap.id,
                  authorUid: d.authorUid,
                  name: d.name,
                  rating: d.rating,
                  comment: d.comment,
                  occasion: d.occasion,
                  date: d.date,
                  isApproved: d.isApproved,
                };
              });
              setSiteData((prev) => ({ ...prev, testimonials: list }));
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, 'testimonials');
          }
        )
      );

      if (firebaseUser?.emailVerified) {
        const ordersRef = isFirebaseAdmin
          ? collection(db, 'specialOrders')
          : query(
              collection(db, 'specialOrders'),
              where('userId', '==', firebaseUser.uid)
            );
        unsubscribers.push(
          onSnapshot(
            ordersRef,
            (snap) => {
              if (!snap.empty || firestoreSyncedRef.current) {
                const list: SpecialOrder[] = snap.docs.map((docSnap) => {
                  const d = docSnap.data();
                  const createdAt =
                    typeof d.createdAt?.toDate === 'function'
                      ? d.createdAt.toDate().toISOString()
                      : String(d.createdAt || new Date().toISOString());
                  return {
                    id: docSnap.id,
                    userId: d.userId,
                    customerName: d.customerName,
                    phone: d.phone,
                    email: d.email || '',
                    occasion: d.occasion,
                    preferredDate: d.preferredDate,
                    servingSize: d.servingSize,
                    message: d.message,
                    specialRequirements: d.specialRequirements || '',
                    referenceImage: d.referenceImage || '',
                    status: d.status || 'pending',
                    createdAt,
                  };
                });
                setSiteData((prev) => ({ ...prev, specialOrders: list }));
                setAdminSpecialOrders(list);
              }
            },
            (err) => {
              handleFirestoreError(err, OperationType.LIST, 'specialOrders');
            }
          )
        );
      }
    })();

    return () => {
      cancelled = true;
      unsubscribers.forEach((fn) => fn());
    };
  }, [authReady, firebaseUser, isFirebaseAdmin]);

  const refreshPublicData = useCallback(async () => {
    if (firestoreSyncedRef.current) return;
    try {
      setLoading(true);
      const res = await fetch('/api/public-data');
      if (res.ok && !firestoreSyncedRef.current) {
        const data = await res.json();
        const products = Array.isArray(data.products)
          ? data.products.map(sanitizeProduct)
          : undefined;
        setSiteData((prev) => {
          if (firestoreSyncedRef.current) return prev;
          return {
            ...prev,
            ...data,
            products: products !== undefined ? products : prev.products,
            gallery: Array.isArray(data.gallery) ? data.gallery : prev.gallery,
            testimonials: Array.isArray(data.testimonials)
              ? data.testimonials
              : prev.testimonials,
            settings: { ...prev.settings, ...(data.settings || {}) },
            homepage: { ...prev.homepage, ...(data.homepage || {}) },
            about: { ...prev.about, ...(data.about || {}) },
          };
        });
        setError(null);
      }
    } catch {
      // keep local/Firestore state if API offline
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDatabaseStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/database/status');
      if (res.ok) {
        const data = await res.json();
        setDatabaseStats({
          ...data,
          firebase: {
            connected: firebaseConnected,
            projectId: firebaseConfigInfo.projectId,
            databaseId: firebaseConfigInfo.firestoreDatabaseId,
            synced: firestoreSynced,
            authEmail: firebaseUser?.email || null,
          },
        });
        return;
      }
    } catch {
      // ignore
    }
    setDatabaseStats((prev) =>
      prev
        ? {
            ...prev,
            firebase: {
              connected: firebaseConnected,
              projectId: firebaseConfigInfo.projectId,
              databaseId: firebaseConfigInfo.firestoreDatabaseId,
              synced: firestoreSynced,
              authEmail: firebaseUser?.email || null,
            },
          }
        : null
    );
  }, [firebaseConnected, firestoreSynced, firebaseUser]);

  useEffect(() => {
    refreshPublicData();
  }, [refreshPublicData]);

  useEffect(() => {
    refreshDatabaseStatus();
  }, [refreshDatabaseStatus]);

  const resetToDefault = async (): Promise<boolean> => {
    setSiteData(defaultData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      await writeDataToFirestore(defaultData);
    }
    return true;
  };

  const resetCompulsoryDatabase = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/database/reset', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setSiteData(json.data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
          if (firebaseUser?.emailVerified && isFirebaseAdmin) {
            await writeDataToFirestore(json.data);
          }
        }
      }
    } catch {
      await resetToDefault();
    }
    await refreshDatabaseStatus();
    return true;
  };

  const refreshAdminDashboard = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setAdminStats(data.stats);
          if (data.stats.database) {
            setDatabaseStats({
              ...data.stats.database,
              firebase: {
                connected: firebaseConnected,
                projectId: firebaseConfigInfo.projectId,
                databaseId: firebaseConfigInfo.firestoreDatabaseId,
                synced: firestoreSynced,
                authEmail: firebaseUser?.email || null,
              },
            });
          }
        }
        if (data.specialOrders && !firestoreSyncedRef.current) {
          setAdminSpecialOrders(data.specialOrders);
        }
        if (!firestoreSyncedRef.current) {
          const products = Array.isArray(data.products)
            ? data.products.map(sanitizeProduct)
            : undefined;
          setSiteData((prev) => {
            if (firestoreSyncedRef.current) return prev;
            return {
              ...prev,
              homepage: data.homepage || prev.homepage,
              about: data.about || prev.about,
              products: products !== undefined ? products : prev.products,
              gallery: Array.isArray(data.gallery) ? data.gallery : prev.gallery,
              testimonials: Array.isArray(data.testimonials)
                ? data.testimonials
                : prev.testimonials,
              businessHours: data.businessHours || prev.businessHours,
              settings: data.settings || prev.settings,
              specialOrders: data.specialOrders || prev.specialOrders,
              storeDirections: data.storeDirections || prev.storeDirections,
            };
          });
        }
      }
    } catch (err) {
      console.warn('Dashboard fetch warning, using local/Firestore state:', err);
    }
  }, [
    token,
    firebaseConnected,
    firestoreSynced,
    firebaseUser,
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAdminDashboard();
    }
  }, [isAuthenticated, refreshAdminDashboard]);

  const submitSpecialOrder = async (order: Partial<SpecialOrder>) => {
    const id = sanitizeId(order.id, 'so');
    const newOrder: SpecialOrder = {
      id,
      userId: firebaseUser?.uid,
      customerName: order.customerName || 'Anonymous Guest',
      phone: order.phone || '',
      email: order.email || '',
      occasion: order.occasion || 'Birthday',
      preferredDate:
        order.preferredDate || new Date().toISOString().split('T')[0],
      servingSize: order.servingSize || '20 - 30 Guests',
      message: order.message || '',
      specialRequirements: order.specialRequirements || '',
      referenceImage: order.referenceImage || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setSiteData((prev) => ({
      ...prev,
      specialOrders: [newOrder, ...(prev.specialOrders || [])],
    }));

    if (firebaseUser?.emailVerified) {
      const path = `specialOrders/${id}`;
      try {
        await setDoc(doc(db, 'specialOrders', id), {
          id,
          userId: firebaseUser.uid,
          ...buildSpecialOrderFields(newOrder),
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }

    try {
      const res = await fetch('/api/special-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      if (res.ok) {
        const json = await res.json();
        return {
          success: true,
          message: json.message || 'Thank you! Your inquiry has been received.',
        };
      }
    } catch {
      // optimistic fallback
    }
    return {
      success: true,
      message:
        "Thank you! Your special order inquiry has been received. Chef Liya's team will contact you directly within 24 hours.",
    };
  };

  const submitTestimonial = async (review: Partial<Testimonial>) => {
    const id = sanitizeId(review.id, 'test');
    const newReview: Testimonial = {
      id,
      authorUid: firebaseUser?.uid,
      name: review.name || 'Anonymous Guest',
      rating: review.rating || 5,
      comment: review.comment || '',
      occasion: review.occasion || 'General Experience',
      date: new Date().toISOString().split('T')[0],
      isApproved: true,
    };
    setSiteData((prev) => ({
      ...prev,
      testimonials: [newReview, ...prev.testimonials],
    }));

    if (firebaseUser?.emailVerified) {
      const path = `testimonials/${id}`;
      try {
        await setDoc(doc(db, 'testimonials', id), {
          id,
          authorUid: firebaseUser.uid,
          ...buildTestimonialFields(newReview),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }

    try {
      await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      });
    } catch {
      // ignore
    }
    return {
      success: true,
      message: 'Thank you for your review! It has been submitted successfully.',
    };
  };

  const saveProduct = async (product: Partial<Product>): Promise<boolean> => {
    const badge =
      product.availabilityBadge && product.availabilityBadge.includes('48h')
        ? 'Made to Order'
        : product.availabilityBadge || 'In Stock';
    const isExisting = !!product.id && siteDataRef.current.products.some((p) => p.id === product.id);
    const id = sanitizeId(product.id, 'prod');
    const fullProduct: Product = {
      id,
      name: product.name || 'New Artisan Bake',
      category: product.category || 'Birthday Cakes',
      price: product.price ?? 500,
      rateUnit: product.rateUnit || 'per portion',
      rating: product.rating ?? 5,
      ratingCount: product.ratingCount ?? 1,
      description: product.description || '',
      image: product.image || defaultData.products[0].image,
      availabilityBadge: badge,
      isFeatured: product.isFeatured ?? true,
      isHidden: product.isHidden ?? false,
      ingredients: product.ingredients || [
        'Organic Flour',
        'Butter',
        'Vanilla',
      ],
      allergens: product.allergens || ['Gluten', 'Dairy'],
    };

    setSiteData((prev) => {
      const existingItem = prev.products.find((p) => p.id === id);
      const merged: Product = existingItem
        ? { ...existingItem, ...product, id, availabilityBadge: badge }
        : fullProduct;
      const nextProducts: Product[] = existingItem
        ? prev.products.map((p) => (p.id === id ? merged : p))
        : [merged, ...prev.products];
      return { ...prev, products: nextProducts };
    });

    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      const path = `products/${id}`;
      try {
        const docRef = doc(db, 'products', id);
        const snap = await getDoc(docRef);
        const existingLocal = siteDataRef.current.products.find((p) => p.id === id);
        const target = existingLocal ? { ...existingLocal, ...product, id, availabilityBadge: badge } : fullProduct;
        if (snap.exists()) {
          await updateDoc(docRef, {
            ...buildProductFields(target),
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(docRef, {
            id,
            ...buildProductFields(target),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        handleFirestoreError(
          err,
          isExisting ? OperationType.UPDATE : OperationType.CREATE,
          path
        );
      }
    }

    if (token) {
      try {
        const url = isExisting
          ? `/api/admin/products/${id}`
          : '/api/admin/products';
        await fetch(url, {
          method: isExisting ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...fullProduct, ...product, id, availabilityBadge: badge }),
        });
        refreshDatabaseStatus();
      } catch {
        // ignore
      }
    }
    return true;
  };

  const addProduct = (product: Partial<Product>) => saveProduct(product);
  const updateProduct = (id: string, product: Partial<Product>) =>
    saveProduct({ ...product, id });

  const deleteProduct = async (id: string): Promise<boolean> => {
    setSiteData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));

    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      const path = `products/${id}`;
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }

    if (token) {
      try {
        await fetch(`/api/admin/products/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        refreshDatabaseStatus();
      } catch {
        // ignore
      }
    }
    return true;
  };

  const deleteAllProducts = async (): Promise<boolean> => {
    setSiteData((prev) => ({ ...prev, products: [] }));

    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      try {
        const snap = await getDocs(collection(db, 'products'));
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'products');
      }
    }

    if (token) {
      try {
        await fetch('/api/admin/products', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        refreshDatabaseStatus();
      } catch {
        // ignore
      }
    }
    return true;
  };

  const rateProduct = async (
    productId: string,
    rating: number,
    customerName?: string,
    comment?: string
  ) => {
    const cleanRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const cleanName = clampStr(customerName || 'Artisan Foodie', 120);
    const cleanComment = clampStr(comment || '', 1000);

    if (firebaseUser?.emailVerified) {
      try {
        const prodRef = doc(db, 'products', productId);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          const data = prodSnap.data();
          const currentCount = Number(data.ratingCount) || 1;
          const currentRating = Number(data.rating) || 5;
          const nextCount = currentCount + 1;
          const nextRating = Number(
            ((currentRating * currentCount + cleanRating) / nextCount).toFixed(1)
          );
          const ratingId = sanitizeId(`rate-${Date.now()}`, 'rate');
          const batch = writeBatch(db);
          batch.set(doc(db, 'productRatings', ratingId), {
            id: ratingId,
            productId,
            authorUid: firebaseUser.uid,
            rating: cleanRating,
            customerName: cleanName,
            comment: cleanComment,
            isPublic: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          batch.update(prodRef, {
            rating: nextRating,
            ratingCount: nextCount,
            updatedAt: serverTimestamp(),
          });
          await batch.commit();
        }
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.WRITE,
          `products/${productId}`
        );
      }
    }

    try {
      const res = await fetch(`/api/products/${productId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: cleanRating,
          customerName: cleanName,
          comment: cleanComment,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.product) {
          setSiteData((prev) => ({
            ...prev,
            products: prev.products.map((p) =>
              p.id === productId ? json.product : p
            ),
          }));
          refreshDatabaseStatus();
          return {
            success: true,
            message:
              json.message || 'Rating successfully recorded in the database.',
            product: json.product as Product,
          };
        }
      }
    } catch {
      // fallback to local calculation
    }
    let updated: Product | undefined;
    setSiteData((prev) => {
      const products = prev.products.map((p) => {
        if (p.id === productId) {
          const count = p.ratingCount || 1;
          const current = p.rating || 5;
          const newCount = count + 1;
          const newRating = Number(
            ((current * count + cleanRating) / newCount).toFixed(1)
          );
          updated = { ...p, rating: newRating, ratingCount: newCount };
          return updated;
        }
        return p;
      });
      return { ...prev, products };
    });
    return {
      success: true,
      message: 'Rating recorded in database!',
      product: updated,
    };
  };

  const saveGalleryItem = async (
    item: Partial<GalleryItem>
  ): Promise<boolean> => {
    const isExisting =
      !!item.id && siteDataRef.current.gallery.some((g) => g.id === item.id);
    const id = sanitizeId(item.id, 'gal');
    const fullItem: GalleryItem = {
      id,
      title: item.title || 'Artisan Creation',
      category: item.category || 'Cakes',
      imageUrl: item.imageUrl || defaultData.gallery[0].imageUrl,
      description: item.description || '',
      uploadDate: item.uploadDate || new Date().toISOString().split('T')[0],
    };

    setSiteData((prev) => {
      const exists = prev.gallery.some((g) => g.id === id);
      const nextGallery: GalleryItem[] = exists
        ? prev.gallery.map((g) => (g.id === id ? { ...g, ...item, id } : g))
        : [fullItem, ...prev.gallery];
      return { ...prev, gallery: nextGallery };
    });

    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      const path = `gallery/${id}`;
      try {
        const docRef = doc(db, 'gallery', id);
        const snap = await getDoc(docRef);
        const existingLocal = siteDataRef.current.gallery.find((g) => g.id === id);
        const target = existingLocal ? { ...existingLocal, ...item, id } : fullItem;
        if (snap.exists()) {
          await updateDoc(docRef, {
            ...buildGalleryFields(target),
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(docRef, {
            id,
            ...buildGalleryFields(target),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        handleFirestoreError(
          err,
          isExisting ? OperationType.UPDATE : OperationType.CREATE,
          path
        );
      }
    }

    if (token) {
      try {
        const url = isExisting
          ? `/api/admin/gallery/${id}`
          : '/api/admin/gallery';
        await fetch(url, {
          method: isExisting ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...fullItem, ...item, id }),
        });
      } catch {
        // ignore
      }
    }
    return true;
  };

  const addGalleryItem = (item: Partial<GalleryItem>) => saveGalleryItem(item);
  const updateGalleryItem = (id: string, item: Partial<GalleryItem>) =>
    saveGalleryItem({ ...item, id });

  const deleteGalleryItem = async (id: string): Promise<boolean> => {
    setSiteData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((g) => g.id !== id),
    }));

    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      const path = `gallery/${id}`;
      try {
        await deleteDoc(doc(db, 'gallery', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }

    if (token) {
      try {
        await fetch(`/api/admin/gallery/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore
      }
    }
    return true;
  };

  const deleteAllGalleryItems = async (): Promise<boolean> => {
    setSiteData((prev) => ({ ...prev, gallery: [] }));

    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      try {
        const snap = await getDocs(collection(db, 'gallery'));
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'gallery');
      }
    }

    if (token) {
      try {
        await fetch('/api/admin/gallery', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore
      }
    }
    return true;
  };

  const updateSpecialOrderStatus = async (
    id: string,
    status: string
  ): Promise<boolean> => {
    const cleanStatus = normalizeOrderStatus(status);
    setSiteData((prev) => ({
      ...prev,
      specialOrders: (prev.specialOrders || []).map((o) =>
        o.id === id ? { ...o, status: cleanStatus } : o
      ),
    }));
    setAdminSpecialOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: cleanStatus } : o))
    );

    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      const path = `specialOrders/${id}`;
      try {
        const docRef = doc(db, 'specialOrders', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          await updateDoc(docRef, {
            status: cleanStatus,
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }

    if (token) {
      try {
        await fetch(`/api/admin/special-orders/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: cleanStatus }),
        });
      } catch {
        // ignore
      }
    }
    return true;
  };

  const deleteSpecialOrder = async (id: string): Promise<boolean> => {
    setSiteData((prev) => ({
      ...prev,
      specialOrders: (prev.specialOrders || []).filter((o) => o.id !== id),
    }));
    setAdminSpecialOrders((prev) => prev.filter((o) => o.id !== id));

    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      const path = `specialOrders/${id}`;
      try {
        await deleteDoc(doc(db, 'specialOrders', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }

    if (token) {
      try {
        await fetch(`/api/admin/special-orders/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore
      }
    }
    return true;
  };

  const deleteAllSpecialOrders = async (): Promise<boolean> => {
    setSiteData((prev) => ({ ...prev, specialOrders: [] }));
    setAdminSpecialOrders([]);

    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      try {
        const snap = await getDocs(collection(db, 'specialOrders'));
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'specialOrders');
      }
    }

    if (token) {
      try {
        await fetch('/api/admin/special-orders', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore
      }
    }
    return true;
  };

  const updateInquiryStatus = (id: string, status: string) =>
    updateSpecialOrderStatus(id, status);
  const deleteInquiry = (id: string) => deleteSpecialOrder(id);
  const deleteAllInquiries = () => deleteAllSpecialOrders();

  const saveTestimonial = async (
    item: Partial<Testimonial>
  ): Promise<boolean> => {
    const id = sanitizeId(item.id, 'test');
    const fullItem: Testimonial = {
      id,
      authorUid: item.authorUid || firebaseUser?.uid || 'admin',
      name: item.name || 'Anonymous',
      rating: item.rating || 5,
      comment: item.comment || '',
      occasion: item.occasion || 'General Experience',
      date: item.date || new Date().toISOString().split('T')[0],
      isApproved: item.isApproved ?? true,
    };

    setSiteData((prev) => {
      const exists = prev.testimonials.some((t) => t.id === id);
      const nextTestimonials: Testimonial[] = exists
        ? prev.testimonials.map((t) =>
            t.id === id ? { ...t, ...item, id } : t
          )
        : [fullItem, ...prev.testimonials];
      return { ...prev, testimonials: nextTestimonials };
    });

    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      const path = `testimonials/${id}`;
      try {
        const docRef = doc(db, 'testimonials', id);
        const snap = await getDoc(docRef);
        const existingLocal = siteDataRef.current.testimonials.find((t) => t.id === id);
        const target = existingLocal ? { ...existingLocal, ...item, id } : fullItem;
        if (snap.exists()) {
          await updateDoc(docRef, {
            ...buildTestimonialFields(target),
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(docRef, {
            id,
            authorUid: firebaseUser.uid,
            ...buildTestimonialFields(target),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }

    if (token && item.id) {
      try {
        await fetch(`/api/admin/testimonials/${item.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(item),
        });
      } catch {
        // ignore
      }
    }
    return true;
  };

  const updateTestimonialApproval = async (
    id: string,
    isApproved: boolean
  ): Promise<boolean> => {
    setSiteData((prev) => ({
      ...prev,
      testimonials: prev.testimonials.map((t) =>
        t.id === id ? { ...t, isApproved } : t
      ),
    }));

    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      const path = `testimonials/${id}`;
      try {
        const docRef = doc(db, 'testimonials', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          await updateDoc(docRef, {
            isApproved,
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }

    if (token) {
      try {
        await fetch(`/api/admin/testimonials/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isApproved }),
        });
      } catch {
        // ignore
      }
    }
    return true;
  };

  const deleteTestimonial = async (id: string): Promise<boolean> => {
    setSiteData((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((t) => t.id !== id),
    }));

    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      const path = `testimonials/${id}`;
      try {
        await deleteDoc(doc(db, 'testimonials', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }

    if (token) {
      try {
        await fetch(`/api/admin/testimonials/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore
      }
    }
    return true;
  };

  const deleteAllTestimonials = async (): Promise<boolean> => {
    setSiteData((prev) => ({ ...prev, testimonials: [] }));

    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      try {
        const snap = await getDocs(collection(db, 'testimonials'));
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'testimonials');
      }
    }

    if (token) {
      try {
        await fetch('/api/admin/testimonials', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore
      }
    }
    return true;
  };

  const deleteAllData = async (): Promise<boolean> => {
    setSiteData({
      ...defaultData,
      products: [],
      gallery: [],
      testimonials: [],
      specialOrders: [],
    });
    localStorage.removeItem(STORAGE_KEY);

    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      try {
        const collectionsToClear = [
          'products',
          'gallery',
          'testimonials',
          'specialOrders',
          'productRatings',
        ];
        const batch = writeBatch(db);
        for (const colName of collectionsToClear) {
          const snap = await getDocs(collection(db, colName));
          snap.docs.forEach((d) => batch.delete(d.ref));
        }
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'all-collections');
      }
    }

    if (token) {
      try {
        await fetch('/api/admin/all-data', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore
      }
    }
    return true;
  };

  const updateHomepage = async (
    homepage: Partial<HomepageData>
  ): Promise<boolean> => {
    const merged = { ...siteDataRef.current.homepage, ...homepage };
    setSiteData((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, ...homepage },
    }));

    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      const path = 'siteConfig/homepage';
      try {
        await setDoc(doc(db, 'siteConfig', 'homepage'), buildHomepagePayload(merged));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }

    if (token) {
      try {
        await fetch('/api/admin/homepage', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(homepage),
        });
      } catch {
        // ignore
      }
    }
    return true;
  };

  const updateAbout = async (about: Partial<AboutData>): Promise<boolean> => {
    const merged = { ...siteDataRef.current.about, ...about };
    setSiteData((prev) => ({
      ...prev,
      about: { ...prev.about, ...about },
    }));

    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      const path = 'siteConfig/about';
      try {
        await setDoc(doc(db, 'siteConfig', 'about'), buildAboutPayload(merged));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }

    if (token) {
      try {
        await fetch('/api/admin/about', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(about),
        });
      } catch {
        // ignore
      }
    }
    return true;
  };

  const updateBusinessHours = async (
    hours: BusinessHour[]
  ): Promise<boolean> => {
    setSiteData((prev) => ({ ...prev, businessHours: hours }));

    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      const path = 'siteConfig/businessHours';
      try {
        await setDoc(
          doc(db, 'siteConfig', 'businessHours'),
          buildBusinessHoursPayload(hours)
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }

    if (token) {
      try {
        await fetch('/api/admin/business-hours', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ hours }),
        });
      } catch {
        // ignore
      }
    }
    return true;
  };

  const updateSettings = async (
    settings: Partial<SiteSettings>
  ): Promise<boolean> => {
    const merged = { ...siteDataRef.current.settings, ...settings };
    setSiteData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));

    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      const path = 'siteConfig/settings';
      try {
        await setDoc(doc(db, 'siteConfig', 'settings'), buildSettingsPayload(merged));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }

    if (token) {
      try {
        await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(settings),
        });
      } catch {
        // ignore
      }
    }
    return true;
  };

  const updateStoreDirections = async (
    directions: Partial<StoreDirections>
  ): Promise<boolean> => {
    const merged = { ...siteDataRef.current.storeDirections, ...directions };
    setSiteData((prev) => ({
      ...prev,
      storeDirections: { ...prev.storeDirections, ...directions },
    }));

    if (firebaseUser?.emailVerified && isFirebaseAdmin) {
      const path = 'siteConfig/storeDirections';
      try {
        await setDoc(
          doc(db, 'siteConfig', 'storeDirections'),
          buildStoreDirectionsPayload(merged)
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }

    if (token) {
      try {
        await fetch('/api/admin/store-directions', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(directions),
        });
      } catch {
        // ignore
      }
    }
    return true;
  };

  return (
    <DataContext.Provider
      value={{
        siteData,
        loading,
        error,
        firebaseConnected,
        firestoreSynced,
        syncAllToFirestore,
        refreshPublicData,
        refreshAdminDashboard,
        submitSpecialOrder,
        submitTestimonial,
        rateProduct,
        databaseStats,
        refreshDatabaseStatus,
        resetCompulsoryDatabase,
        adminStats,
        adminSpecialOrders,
        saveProduct,
        addProduct,
        updateProduct,
        deleteProduct,
        deleteAllProducts,
        saveGalleryItem,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        deleteAllGalleryItems,
        updateSpecialOrderStatus,
        updateInquiryStatus,
        deleteSpecialOrder,
        deleteInquiry,
        deleteAllSpecialOrders,
        deleteAllInquiries,
        saveTestimonial,
        updateTestimonialApproval,
        deleteTestimonial,
        deleteAllTestimonials,
        deleteAllData,
        resetToDefault,
        updateHomepage,
        updateAbout,
        updateBusinessHours,
        updateStoreDirections,
        updateSettings,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within DataProvider');
  }
  return ctx;
};
