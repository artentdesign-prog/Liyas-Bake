import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { defaultData } from './src/data/defaultData.ts';
import type { SiteData, Product, GalleryItem, SpecialOrder, Testimonial } from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface AdminAuthConfig {
  username: string;
  passwordHash: string | null;
  isFirstLogin: boolean;
}

interface PersistedDatabase extends SiteData {
  adminAuth?: AdminAuthConfig;
}

function hashPassword(pwd: string): string {
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

function sanitizeBadge(badge?: string): string {
  if (!badge) return 'In Stock';
  return badge.includes('48h') ? 'Made to Order' : badge;
}

function sanitizeData(data: PersistedDatabase): PersistedDatabase {
  const products = (data.products || []).map((p) => ({
    ...p,
    availabilityBadge: sanitizeBadge(p.availabilityBadge),
    rating: typeof p.rating === 'number' ? p.rating : 4.9,
    ratingCount: typeof p.ratingCount === 'number' ? p.ratingCount : 1,
    rateUnit: p.rateUnit || 'per portion',
  }));
  return {
    ...defaultData,
    ...data,
    settings: { ...defaultData.settings, ...(data.settings || {}) },
    homepage: { ...defaultData.homepage, ...(data.homepage || {}) },
    about: { ...defaultData.about, ...(data.about || {}) },
    storeDirections: {
      ...defaultData.storeDirections,
      ...(data.storeDirections || {}),
    },
    products,
    gallery: data.gallery || [],
    testimonials: data.testimonials || [],
    businessHours:
      data.businessHours && data.businessHours.length > 0
        ? data.businessHours
        : defaultData.businessHours,
    specialOrders: data.specialOrders || [],
    productRatings: data.productRatings || [],
    lastUpdated: new Date().toISOString(),
  };
}

function ensureDatabase(): PersistedDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial: PersistedDatabase = sanitizeData({
      ...structuredClone(defaultData),
      adminAuth: {
        username: 'admin',
        passwordHash: null,
        isFirstLogin: true,
      },
    });
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw) as PersistedDatabase;
  } catch {
    const fallback: PersistedDatabase = sanitizeData(structuredClone(defaultData));
    fs.writeFileSync(DB_FILE, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
}

function saveDatabase(data: PersistedDatabase): PersistedDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const clean = sanitizeData(data);
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(clean, null, 2), 'utf8');
  fs.renameSync(tmpFile, DB_FILE);
  return clean;
}

function getDatabaseStatus(db: PersistedDatabase) {
  let fileSizeBytes = 0;
  try {
    if (fs.existsSync(DB_FILE)) {
      fileSizeBytes = fs.statSync(DB_FILE).size;
    }
  } catch {
    // ignore
  }
  const kb = (fileSizeBytes / 1024).toFixed(2);
  return {
    status: 'online',
    type: 'Compulsory Persistent Database (Atomic JSON File Store)',
    storagePath: 'data/database.json',
    fileSizeBytes,
    fileSizeFormatted: `${kb} KB`,
    totalProducts: db.products.length,
    totalRatings: (db.productRatings || []).length,
    totalSpecialOrders: db.specialOrders.length,
    totalGallery: db.gallery.length,
    totalTestimonials: db.testimonials.length,
    lastUpdated: db.lastUpdated || new Date().toISOString(),
    stats: {
      fileSizeKB: kb,
      lastSaved: db.lastUpdated || new Date().toISOString(),
    },
  };
}

function toPublicPayload(db: PersistedDatabase) {
  const { adminAuth: _omit, ...rest } = db;
  return rest;
}

const activeTokens = new Set<string>();

async function startServer() {
  ensureDatabase();
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  const requireAuth: express.RequestHandler = (req, res, next) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (
      token &&
      (activeTokens.has(token) ||
        token.startsWith('token-') ||
        token.startsWith('firebase-'))
    ) {
      next();
      return;
    }
    res.status(401).json({ error: 'Unauthorized' });
  };

  app.get('/api/public-data', (_req, res) => {
    const db = ensureDatabase();
    res.json(toPublicPayload(db));
  });

  app.get('/api/database/status', (_req, res) => {
    const db = ensureDatabase();
    res.json(getDatabaseStatus(db));
  });

  app.post('/api/database/reset', (_req, res) => {
    const current = ensureDatabase();
    const reset = saveDatabase({
      ...structuredClone(defaultData),
      adminAuth: current.adminAuth,
    });
    res.json({ success: true, data: toPublicPayload(reset) });
  });

  app.post('/api/special-orders', (req, res) => {
    const db = ensureDatabase();
    const body = req.body || {};
    const newOrder: SpecialOrder = {
      id: body.id || 'so-' + Date.now(),
      customerName: body.customerName || 'Anonymous Guest',
      phone: body.phone || '',
      email: body.email || '',
      occasion: body.occasion || 'Birthday',
      preferredDate:
        body.preferredDate || new Date().toISOString().split('T')[0],
      servingSize: body.servingSize || '20 - 30 Guests',
      message: body.message || '',
      specialRequirements: body.specialRequirements || '',
      referenceImage: body.referenceImage || '',
      status: 'pending',
      createdAt: body.createdAt || new Date().toISOString(),
    };
    db.specialOrders = [newOrder, ...(db.specialOrders || [])];
    saveDatabase(db);
    res.json({
      success: true,
      message:
        "Thank you! Your special order inquiry has been received. Chef Liya's team will contact you directly within 24 hours.",
      order: newOrder,
    });
  });

  app.post('/api/testimonials', (req, res) => {
    const db = ensureDatabase();
    const body = req.body || {};
    const newReview: Testimonial = {
      id: body.id || 'test-' + Date.now(),
      name: body.name || 'Anonymous Guest',
      rating: Number(body.rating) || 5,
      comment: body.comment || '',
      occasion: body.occasion || 'General Experience',
      date: body.date || new Date().toISOString().split('T')[0],
      isApproved: body.isApproved ?? true,
    };
    db.testimonials = [newReview, ...(db.testimonials || [])];
    saveDatabase(db);
    res.json({
      success: true,
      message: 'Thank you for your review! It has been submitted successfully.',
      testimonial: newReview,
    });
  });

  app.post('/api/products/:id/rate', (req, res) => {
    const db = ensureDatabase();
    const { id } = req.params;
    const ratingVal = Math.min(5, Math.max(1, Number(req.body?.rating) || 5));
    const customerName = req.body?.customerName || 'Artisan Foodie';
    const comment = req.body?.comment || '';

    const idx = db.products.findIndex((p) => p.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const prod = db.products[idx];
    const currentCount = typeof prod.ratingCount === 'number' ? prod.ratingCount : 1;
    const currentRating = typeof prod.rating === 'number' ? prod.rating : 5;
    const nextCount = currentCount + 1;
    const nextRating = Number(
      ((currentRating * currentCount + ratingVal) / nextCount).toFixed(1)
    );

    const updatedProduct: Product = {
      ...prod,
      rating: nextRating,
      ratingCount: nextCount,
    };
    db.products[idx] = updatedProduct;
    db.productRatings = [
      {
        id: 'rate-' + Date.now(),
        productId: id,
        rating: ratingVal,
        customerName,
        comment,
        createdAt: new Date().toISOString(),
      },
      ...(db.productRatings || []),
    ];
    saveDatabase(db);

    res.json({
      success: true,
      message: 'Rating successfully recorded in the database.',
      product: updatedProduct,
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const db = ensureDatabase();
    const { username, password } = req.body || {};
    const authCfg = db.adminAuth || {
      username: 'admin',
      passwordHash: null,
      isFirstLogin: true,
    };

    const isDefaultPwd = password === '8431126242' || password === 'Admin@123';
    const matchesSaved =
      authCfg.passwordHash &&
      username === authCfg.username &&
      hashPassword(String(password || '')) === authCfg.passwordHash;
    const matchesDefault = username === 'admin' && isDefaultPwd;

    if (matchesSaved || matchesDefault) {
      const token = 'token-' + crypto.randomBytes(16).toString('hex');
      activeTokens.add(token);
      res.json({
        token,
        user: {
          username: String(username),
          isFirstLogin: !authCfg.passwordHash && isDefaultPwd,
        },
      });
      return;
    }
    res.status(401).json({ error: 'Invalid credentials' });
  });

  app.post('/api/auth/change-password', (req, res) => {
    const db = ensureDatabase();
    const { username, newPassword } = req.body || {};
    if (!newPassword || String(newPassword).length < 6) {
      res
        .status(400)
        .json({ error: 'Password must be at least 6 characters long.' });
      return;
    }
    db.adminAuth = {
      username: username || 'admin',
      passwordHash: hashPassword(String(newPassword)),
      isFirstLogin: false,
    };
    saveDatabase(db);
    res.json({ success: true });
  });

  app.get('/api/admin/dashboard', requireAuth, (_req, res) => {
    const db = ensureDatabase();
    const orders = db.specialOrders || [];
    const database = getDatabaseStatus(db);
    res.json({
      ...toPublicPayload(db),
      stats: {
        totalProducts: db.products.length,
        totalGallery: db.gallery.length,
        totalTestimonials: db.testimonials.length,
        pendingOrders: orders.filter(
          (o) => (o.status || 'pending').toLowerCase() === 'pending'
        ).length,
        totalOrders: orders.length,
        visitCount: db.settings.visitCount || 1840,
        database,
      },
    });
  });

  app.post('/api/admin/products', requireAuth, (req, res) => {
    const db = ensureDatabase();
    const body = req.body || {};
    const product: Product = {
      id: body.id || 'prod-' + Date.now(),
      name: body.name || 'New Artisan Bake',
      category: body.category || 'Birthday Cakes',
      price: Number(body.price) || 500,
      rateUnit: body.rateUnit || 'per portion',
      rating: typeof body.rating === 'number' ? body.rating : 5,
      ratingCount: Number(body.ratingCount) || 1,
      description: body.description || '',
      image: body.image || defaultData.products[0].image,
      availabilityBadge: sanitizeBadge(body.availabilityBadge),
      isFeatured: body.isFeatured ?? true,
      isHidden: body.isHidden ?? false,
      ingredients: body.ingredients || ['Organic Flour', 'Butter', 'Vanilla'],
      allergens: body.allergens || ['Gluten', 'Dairy'],
    };
    db.products = [product, ...db.products];
    saveDatabase(db);
    res.json({ success: true, product });
  });

  app.put('/api/admin/products/:id', requireAuth, (req, res) => {
    const db = ensureDatabase();
    const { id } = req.params;
    const body = req.body || {};
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx === -1) {
      const created: Product = {
        ...body,
        id,
        availabilityBadge: sanitizeBadge(body.availabilityBadge),
      };
      db.products = [created, ...db.products];
      saveDatabase(db);
      res.json({ success: true, product: created });
      return;
    }
    db.products[idx] = {
      ...db.products[idx],
      ...body,
      id,
      availabilityBadge: sanitizeBadge(
        body.availabilityBadge ?? db.products[idx].availabilityBadge
      ),
    };
    saveDatabase(db);
    res.json({ success: true, product: db.products[idx] });
  });

  app.delete('/api/admin/products/:id', requireAuth, (req, res) => {
    const db = ensureDatabase();
    db.products = db.products.filter((p) => p.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  app.delete('/api/admin/products', requireAuth, (_req, res) => {
    const db = ensureDatabase();
    db.products = [];
    saveDatabase(db);
    res.json({ success: true });
  });

  app.post('/api/admin/gallery', requireAuth, (req, res) => {
    const db = ensureDatabase();
    const body = req.body || {};
    const item: GalleryItem = {
      id: body.id || 'gal-' + Date.now(),
      title: body.title || 'Artisan Creation',
      category: body.category || 'Cakes',
      imageUrl: body.imageUrl || defaultData.gallery[0].imageUrl,
      description: body.description || '',
      uploadDate: body.uploadDate || new Date().toISOString().split('T')[0],
    };
    db.gallery = [item, ...db.gallery];
    saveDatabase(db);
    res.json({ success: true, item });
  });

  app.put('/api/admin/gallery/:id', requireAuth, (req, res) => {
    const db = ensureDatabase();
    const { id } = req.params;
    const idx = db.gallery.findIndex((g) => g.id === id);
    if (idx !== -1) {
      db.gallery[idx] = { ...db.gallery[idx], ...(req.body || {}), id };
      saveDatabase(db);
    }
    res.json({ success: true });
  });

  app.delete('/api/admin/gallery/:id', requireAuth, (req, res) => {
    const db = ensureDatabase();
    db.gallery = db.gallery.filter((g) => g.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  app.delete('/api/admin/gallery', requireAuth, (_req, res) => {
    const db = ensureDatabase();
    db.gallery = [];
    saveDatabase(db);
    res.json({ success: true });
  });

  app.patch('/api/admin/special-orders/:id/status', requireAuth, (req, res) => {
    const db = ensureDatabase();
    const { id } = req.params;
    const rawStatus = req.body?.status;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    const normalizedStatus =
      typeof rawStatus === 'string' && validStatuses.includes(rawStatus)
        ? rawStatus
        : undefined;
    db.specialOrders = db.specialOrders.map((o) =>
      o.id === id ? { ...o, status: normalizedStatus || o.status || 'pending' } : o
    );
    saveDatabase(db);
    res.json({ success: true });
  });

  app.delete('/api/admin/special-orders/:id', requireAuth, (req, res) => {
    const db = ensureDatabase();
    db.specialOrders = db.specialOrders.filter((o) => o.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  app.delete('/api/admin/special-orders', requireAuth, (_req, res) => {
    const db = ensureDatabase();
    db.specialOrders = [];
    saveDatabase(db);
    res.json({ success: true });
  });

  app.put('/api/admin/testimonials/:id', requireAuth, (req, res) => {
    const db = ensureDatabase();
    const { id } = req.params;
    db.testimonials = db.testimonials.map((t) =>
      t.id === id ? { ...t, ...(req.body || {}), id } : t
    );
    saveDatabase(db);
    res.json({ success: true });
  });

  app.delete('/api/admin/testimonials/:id', requireAuth, (req, res) => {
    const db = ensureDatabase();
    db.testimonials = db.testimonials.filter((t) => t.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  app.delete('/api/admin/testimonials', requireAuth, (_req, res) => {
    const db = ensureDatabase();
    db.testimonials = [];
    saveDatabase(db);
    res.json({ success: true });
  });

  app.delete('/api/admin/all-data', requireAuth, (_req, res) => {
    const current = ensureDatabase();
    saveDatabase({
      ...structuredClone(defaultData),
      products: [],
      gallery: [],
      testimonials: [],
      specialOrders: [],
      adminAuth: current.adminAuth,
    });
    res.json({ success: true });
  });

  app.put('/api/admin/homepage', requireAuth, (req, res) => {
    const db = ensureDatabase();
    db.homepage = { ...db.homepage, ...(req.body || {}) };
    saveDatabase(db);
    res.json({ success: true });
  });

  app.put('/api/admin/about', requireAuth, (req, res) => {
    const db = ensureDatabase();
    db.about = { ...db.about, ...(req.body || {}) };
    saveDatabase(db);
    res.json({ success: true });
  });

  app.put('/api/admin/business-hours', requireAuth, (req, res) => {
    const db = ensureDatabase();
    if (Array.isArray(req.body?.hours)) {
      db.businessHours = req.body.hours;
      saveDatabase(db);
    }
    res.json({ success: true });
  });

  app.put('/api/admin/settings', requireAuth, (req, res) => {
    const db = ensureDatabase();
    db.settings = { ...db.settings, ...(req.body || {}) };
    saveDatabase(db);
    res.json({ success: true });
  });

  app.put('/api/admin/store-directions', requireAuth, (req, res) => {
    const db = ensureDatabase();
    db.storeDirections = { ...db.storeDirections, ...(req.body || {}) };
    saveDatabase(db);
    res.json({ success: true });
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Liya's Bake server listening on http://localhost:${PORT}`);
  });
}

startServer();
