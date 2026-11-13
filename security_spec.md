# Firestore Security Specification — Liya's Bake

## 1. Data Invariants
1. **Strict Document & Field Boundaries**: Every writable collection enforces `keys().hasAll(...)` and `keys().hasOnly(...)` inside dedicated `isValid[Entity](data)` validators so arbitrary shadow fields or oversized strings are rejected.
2. **Path ID Hardening**: Single-document operations validate `isValidId(docId)` matching `^[a-zA-Z0-9_-]+$` with length `1..128`.
3. **Server-Enforced Temporal Integrity**: All `createdAt` and `updatedAt` timestamps on Firestore writes MUST equal `request.time`. Updates preserve `createdAt == existing().createdAt`.
4. **PII Isolation (`specialOrders`)**: Customer contact details (`phone`, `email`, `customerName`) are readable/listable ONLY by a verified admin (`isBootstrappedAdmin()` or `/admins/{uid}`) or the verified owner (`resource.data.userId == request.auth.uid`). Public/unverified users can never list or read other guests' orders.
5. **Catalog & Showcase Visibility Filtering**: Public `list` queries explicitly evaluate `resource.data`: `products` requires `isHidden == false`, `gallery` requires `isPublic == true`, `testimonials` requires `isApproved == true`, and `productRatings` requires `isPublic == true` unless accessed by the bootstrapped admin (`artentdesign@gmail.com`).
6. **Terminal State Locking (`specialOrders`)**: Once an order reaches `completed` or `cancelled`, non-admins cannot mutate it. Non-admin owners may only cancel a `pending` order using `affectedKeys().hasOnly(['status', 'updatedAt'])`.
7. **Atomic Rating & Counter Sync**: Creating a `/productRatings/{ratingId}` document validates that the referenced `/products/{productId}` exists and verifies via `getAfter()` that the parent product's `ratingCount` is incremented atomically in the same batch.
8. **Admin Privilege Protection**: Self-assignment to `/admins/{uid}` is blocked; only the bootstrapped admin (`request.auth.token.email == 'artentdesign@gmail.com' && request.auth.token.email_verified == true`) can create or revoke admin records.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unverified Email Write**: Authenticated user with `email_verified: false` attempting `create` on `/specialOrders/so-1`. -> `PERMISSION_DENIED`
2. **Shadow Field Injection**: Verified user sending extra `{ isAdmin: true }` or `{ discount: 99 }` on `/testimonials/t-1` create. -> `PERMISSION_DENIED`
3. **Cross-Tenant PII Read/List**: Verified non-admin user listing `/specialOrders` without filtering to `userId == auth.uid`. -> `PERMISSION_DENIED`
4. **UID Spoofing on Order Create**: Verified user A creating `/specialOrders/so-2` with `userId: 'user-B'`. -> `PERMISSION_DENIED`
5. **Backdated Timestamp Spoofing**: Admin or user setting `createdAt` to a client `Timestamp` instead of `request.time`. -> `PERMISSION_DENIED`
6. **Poisoned Document ID**: Attempting `create` at `/products/../../bad$id!` failing `^[a-zA-Z0-9_-]+$`. -> `PERMISSION_DENIED`
7. **Denial-of-Wallet String Overflow**: Submitting a `description` or `comment` exceeding schema `maxLength` (e.g., 5000 chars on a 2000-char limit). -> `PERMISSION_DENIED`
8. **Hidden Product Enumeration**: Guest or non-admin listing `/products` where `isHidden == true`. -> `PERMISSION_DENIED`
9. **Unapproved Testimonial Scraping**: Guest listing `/testimonials` where `isApproved == false`. -> `PERMISSION_DENIED`
10. **Terminal State Bypass**: Non-admin user changing `status` from `'completed'` back to `'pending'` on `/specialOrders/so-1`. -> `PERMISSION_DENIED`
11. **Self-Assigned Admin Escalation**: Non-admin authenticated user attempting to `create` `/admins/{theirUid}`. -> `PERMISSION_DENIED`
12. **Orphaned / Non-Atomic Product Rating**: Verified user creating `/productRatings/r-1` for a non-existent `productId` or without atomically updating `/products/{productId}`. -> `PERMISSION_DENIED`
