import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Cake,
  Mail,
  Image as ImageIcon,
  Clock,
  MapPin,
  Star,
  Database,
  Settings,
  Shield,
  ExternalLink,
  LogOut,
  AlertTriangle,
  ArrowRight,
  Search,
  Plus,
  Trash2,
  SquarePen,
  EyeOff,
  Eye,
  Sparkles,
  RefreshCw,
  Download,
  Server,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ImagePicker } from '../components/ImagePicker';
import {
  BusinessHour,
  GalleryItem,
  Product,
  SiteSettings,
  StoreDirections,
} from '../types';

type TabId =
  | 'overview'
  | 'products'
  | 'inquiries'
  | 'gallery'
  | 'hours'
  | 'directions'
  | 'testimonials'
  | 'database'
  | 'settings'
  | 'security';

interface DeleteTarget {
  id: string;
  name: string;
  type:
    | 'product'
    | 'all-products'
    | 'gallery'
    | 'all-gallery'
    | 'testimonial'
    | 'all-testimonials'
    | 'special-order'
    | 'all-special-orders'
    | 'all-data';
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    user,
    logout,
    updateAdminInfo,
    firebaseUser,
    isFirebaseAdmin,
    signInWithGoogle,
  } = useAuth();
  const {
    siteData,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteAllProducts,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    deleteAllGalleryItems,
    deleteTestimonial,
    deleteAllTestimonials,
    updateTestimonialApproval,
    updateInquiryStatus,
    deleteInquiry,
    deleteAllInquiries,
    updateBusinessHours,
    updateStoreDirections,
    updateSettings,
    deleteAllData,
    resetToDefault,
    databaseStats,
    refreshDatabaseStatus,
    resetCompulsoryDatabase,
    firebaseConnected,
    firestoreSynced,
    syncAllToFirestore,
  } = useData();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmResetType, setConfirmResetType] = useState<
    'default' | 'compulsory' | null
  >(null);
  const [resetting, setResetting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    category: 'Birthday Cakes',
    price: 950,
    rateUnit: 'per cake',
    rating: 5,
    ratingCount: 1,
    description: '',
    image: '',
    availabilityBadge: 'Baked Fresh Daily',
    isFeatured: true,
    ingredients: [],
    allergens: [],
  });
  const [productSearch, setProductSearch] = useState('');

  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [addingGallery, setAddingGallery] = useState(false);
  const [galleryForm, setGalleryForm] = useState<Partial<GalleryItem>>({
    title: '',
    category: 'Cakes',
    imageUrl: '',
    description: '',
  });

  const [settingsForm, setSettingsForm] = useState<SiteSettings>(
    siteData.settings
  );
  const [directionsForm, setDirectionsForm] = useState<StoreDirections>(
    siteData.storeDirections || {
      address:
        siteData.settings?.address ||
        'jolly mohalla masjid road pvr road bengaluru karnataka 560053',
      landmark: 'Near Jolly Mohalla Masjid & PVR Road Crossing, Bengaluru',
      googleMapsUrl:
        siteData.settings?.googleMapsUrl ||
        'https://www.google.com/maps/search/?api=1&query=jolly+mohalla+masjid+road+pvr+road+bengaluru+karnataka+560053',
      mapEmbedUrl:
        'https://maps.google.com/maps?q=jolly%20mohalla%20masjid%20road%20pvr%20road%20bengaluru%20karnataka%20560053&t=&z=15&ie=UTF8&iwloc=&output=embed',
      transportGuide:
        'Located near Chickpet/K.R. Market metro stations. Ample two-wheeler parking in front of the counter. For four-wheelers, paid public parking is available 200m away on PVR Road.',
    }
  );
  const [hoursForm, setHoursForm] = useState<BusinessHour[]>(
    siteData.businessHours
  );
  const [adminUsername, setAdminUsername] = useState(user?.username || 'admin');
  const [adminNewPassword, setAdminNewPassword] = useState('');

  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState('All');

  useEffect(() => {
    setSettingsForm(siteData.settings);
    setHoursForm(siteData.businessHours);
    if (siteData.storeDirections) {
      setDirectionsForm(siteData.storeDirections);
    }
  }, [siteData.settings, siteData.businessHours, siteData.storeDirections]);

  const pendingCount = siteData.specialOrders.filter(
    (o) => (o.status || 'pending').toLowerCase() === 'pending'
  ).length;

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase();
    return siteData.products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [siteData.products, productSearch]);

  const filteredInquiries = useMemo(() => {
    const q = inquirySearch.toLowerCase();
    return siteData.specialOrders.filter((o) => {
      const matchesText =
        o.customerName.toLowerCase().includes(q) ||
        o.phone.includes(inquirySearch) ||
        o.occasion.toLowerCase().includes(q);
      const matchesStatus =
        inquiryFilter === 'All' ||
        (o.status || 'pending').toLowerCase() === inquiryFilter.toLowerCase();
      return matchesText && matchesStatus;
    });
  }, [siteData.specialOrders, inquirySearch, inquiryFilter]);

  if (!isAuthenticated) return null;

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const cloudWarning =
      firestoreSynced && !isFirebaseAdmin
        ? ' (Connect Google in header to delete from Cloud Firestore too)'
        : '';
    try {
      switch (deleteTarget.type) {
        case 'product':
          await deleteProduct(deleteTarget.id);
          showToast('Product deleted successfully' + cloudWarning);
          break;
        case 'all-products':
          await deleteAllProducts();
          showToast('All products deleted' + cloudWarning);
          break;
        case 'gallery':
          await deleteGalleryItem(deleteTarget.id);
          showToast('Gallery image deleted' + cloudWarning);
          break;
        case 'all-gallery':
          await deleteAllGalleryItems();
          showToast('All gallery items deleted' + cloudWarning);
          break;
        case 'testimonial':
          await deleteTestimonial(deleteTarget.id);
          showToast('Review deleted' + cloudWarning);
          break;
        case 'all-testimonials':
          await deleteAllTestimonials();
          showToast('All reviews deleted' + cloudWarning);
          break;
        case 'special-order':
          await deleteInquiry(deleteTarget.id);
          showToast('Inquiry deleted' + cloudWarning);
          break;
        case 'all-special-orders':
          await deleteAllInquiries();
          showToast('All inquiries deleted' + cloudWarning);
          break;
        case 'all-data':
          await deleteAllData();
          showToast('All store data deleted' + cloudWarning);
          break;
      }
    } catch {
      showToast('Failed to delete item. Check Firebase permissions.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleConfirmReset = async () => {
    if (!confirmResetType) return;
    setResetting(true);
    try {
      if (confirmResetType === 'default') {
        await resetToDefault();
        showToast('Reset to default data complete!');
      } else {
        await resetCompulsoryDatabase();
        showToast('Compulsory database refreshed with fresh clean products!');
      }
    } catch {
      showToast('Failed to reset database.');
    } finally {
      setResetting(false);
      setConfirmResetType(null);
    }
  };

  const tabs: {
    id: TabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'products',
      label: 'Products',
      icon: Cake,
      badge: siteData.products.length,
    },
    {
      id: 'inquiries',
      label: 'Special Inquiries',
      icon: Mail,
      badge: pendingCount,
    },
    {
      id: 'gallery',
      label: 'Gallery',
      icon: ImageIcon,
      badge: siteData.gallery.length,
    },
    { id: 'hours', label: 'Business Hours', icon: Clock },
    { id: 'directions', label: 'Store Directions', icon: MapPin },
    {
      id: 'testimonials',
      label: 'Reviews',
      icon: Star,
      badge: siteData.testimonials.length,
    },
    {
      id: 'database',
      label: 'Database & Storage',
      icon: Database,
      badge: 'Compulsory',
    },
    { id: 'settings', label: 'Website Settings', icon: Settings },
    { id: 'security', label: 'Security & Auth', icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#3E2723] dark:bg-gold-500 text-white dark:text-chocolate-950 font-bold text-xs shadow-2xl flex items-center gap-2 border border-gold-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-950" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold-500/20 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400 block">
            Executive Control Suite
          </span>
          <h1 className="font-serif text-3xl font-extrabold text-chocolate-900 dark:text-cream-50 mt-1">
            Liya&apos;s Bake Admin Portal
          </h1>
          <p className="text-xs text-chocolate-600 dark:text-cream-300">
            Logged in as{' '}
            <strong className="text-gold-600 dark:text-gold-400">
              {user?.username}
            </strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isFirebaseAdmin ? (
            <button
              type="button"
              onClick={async () => {
                const res = await signInWithGoogle(true);
                if (res.success && res.isAdmin) {
                  showToast('Firebase Firestore Admin connected & synced!');
                } else {
                  showToast(res.error || 'Could not connect Google account.');
                }
              }}
              className="px-4 py-2 rounded-xl bg-amber-500/15 text-amber-800 dark:text-gold-300 border border-gold-500/40 text-xs font-bold flex items-center gap-1.5 hover:bg-gold-500 hover:text-chocolate-950 transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Connect Google for Firestore Sync</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={async () => {
                try {
                  const ok = await syncAllToFirestore();
                  showToast(
                    ok
                      ? 'All data synced to Firebase Firestore!'
                      : 'Firestore sync skipped.'
                  );
                } catch {
                  showToast('Firestore sync failed. Check permissions.');
                }
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                {firestoreSynced ? 'Firestore Live Synced' : 'Sync to Firestore'}
              </span>
            </button>
          )}
          <Link
            to="/"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-white/60 dark:bg-chocolate-800 text-chocolate-800 dark:text-cream-200 text-xs font-bold flex items-center gap-1.5 border border-gold-500/30 hover:bg-white transition-colors"
          >
            <span>Preview Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 p-3 rounded-3xl bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-lg backdrop-blur-md">
          <div className="px-3 py-2 mb-1 border-b border-gold-500/15 hidden lg:block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400">
              Navigation
            </span>
          </div>
          <nav className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-col gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 transition-all cursor-pointer text-left ${
                    active
                      ? 'bg-[#3E2723] text-white dark:bg-gold-500 dark:text-chocolate-950 shadow-md'
                      : 'bg-white/40 dark:bg-chocolate-900/40 text-chocolate-800 dark:text-cream-200 hover:bg-white/70 dark:hover:bg-chocolate-800'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </span>
                  {tab.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        active
                          ? 'bg-gold-400 text-chocolate-950 dark:bg-chocolate-900 dark:text-gold-300'
                          : 'bg-gold-500/20 text-gold-700 dark:text-gold-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 min-w-0 w-full space-y-8">
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              onClick={() => setActiveTab('products')}
              className="p-6 rounded-3xl bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-md cursor-pointer hover:border-gold-500 transition-all space-y-2"
            >
              <div className="flex items-center justify-between text-gold-600 dark:text-gold-400">
                <Cake className="w-6 h-6" />
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Catalog
                </span>
              </div>
              <h3 className="text-3xl font-extrabold font-serif text-chocolate-900 dark:text-cream-50">
                {siteData.products.length}
              </h3>
              <p className="text-xs text-chocolate-600 dark:text-cream-300">
                Total active products
              </p>
            </div>

            <div
              onClick={() => setActiveTab('inquiries')}
              className="p-6 rounded-3xl bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-md cursor-pointer hover:border-gold-500 transition-all space-y-2"
            >
              <div className="flex items-center justify-between text-amber-500">
                <Mail className="w-6 h-6" />
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Inquiries
                </span>
              </div>
              <h3 className="text-3xl font-extrabold font-serif text-chocolate-900 dark:text-cream-50">
                {siteData.specialOrders.length}
              </h3>
              <p className="text-xs text-chocolate-600 dark:text-cream-300">
                {pendingCount} pending reviews
              </p>
            </div>

            <div
              onClick={() => setActiveTab('gallery')}
              className="p-6 rounded-3xl bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-md cursor-pointer hover:border-gold-500 transition-all space-y-2"
            >
              <div className="flex items-center justify-between text-gold-600 dark:text-gold-400">
                <ImageIcon className="w-6 h-6" />
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Portfolio
                </span>
              </div>
              <h3 className="text-3xl font-extrabold font-serif text-chocolate-900 dark:text-cream-50">
                {siteData.gallery.length}
              </h3>
              <p className="text-xs text-chocolate-600 dark:text-cream-300">
                Gallery showcase images
              </p>
            </div>

            <div
              onClick={() => setActiveTab('testimonials')}
              className="p-6 rounded-3xl bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-md cursor-pointer hover:border-gold-500 transition-all space-y-2"
            >
              <div className="flex items-center justify-between text-gold-600 dark:text-gold-400">
                <Star className="w-6 h-6" />
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Reviews
                </span>
              </div>
              <h3 className="text-3xl font-extrabold font-serif text-chocolate-900 dark:text-cream-50">
                {siteData.testimonials.length}
              </h3>
              <p className="text-xs text-chocolate-600 dark:text-cream-300">
                Guest testimonials
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 rounded-[32px] bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-chocolate-900 dark:text-cream-50">
                  Recent Special Orders
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('inquiries')}
                  className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline"
                >
                  View All
                </button>
              </div>
              {siteData.specialOrders.length === 0 ? (
                <p className="text-xs text-chocolate-600">
                  No special orders submitted yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {siteData.specialOrders.slice(0, 4).map((o) => (
                    <div
                      key={o.id}
                      className="p-3.5 rounded-2xl bg-cream-50 dark:bg-chocolate-800/60 border border-gold-500/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="block font-bold text-chocolate-900 dark:text-cream-50">
                          {o.customerName}
                        </strong>
                        <span className="text-chocolate-600 dark:text-cream-300 text-[10px]">
                          {o.occasion} • {o.phone}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          (o.status || 'pending').toLowerCase() === 'pending'
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                            : (o.status || '').toLowerCase() === 'completed' ||
                              (o.status || '').toLowerCase() === 'confirmed'
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {o.status || 'pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 rounded-[32px] bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-md space-y-4">
              <h3 className="font-serif text-lg font-bold text-chocolate-900 dark:text-cream-50 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Store Pickup Direct Rule</span>
              </h3>
              <p className="text-xs text-chocolate-800 dark:text-cream-200 leading-relaxed">
                Remember that customer orders must be collected directly from the
                storefront counter:
              </p>
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-gold-500/40 text-xs font-bold text-amber-900 dark:text-gold-200">
                &quot;{siteData.settings.pickupNotice}&quot;
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1"
              >
                <span>Edit Notice in Settings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 rounded-[32px] bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-md space-y-3 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gold-500/10 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                  <h3 className="font-serif text-lg font-bold text-chocolate-900 dark:text-cream-50">
                    Compulsory Database Storage Status
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('database')}
                  className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Manage Database &amp; Exports</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-cream-50 dark:bg-chocolate-800/60 border border-gold-500/10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-chocolate-600 dark:text-cream-300">
                    Order Restrictions
                  </div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                    48h Ahead Removed
                  </div>
                  <div className="text-[10px] text-chocolate-600 dark:text-cream-300">
                    All products sanitized
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-cream-50 dark:bg-chocolate-800/60 border border-gold-500/10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-chocolate-600 dark:text-cream-300">
                    Product Rates &amp; Units
                  </div>
                  <div className="font-bold text-gold-600 dark:text-gold-400 text-sm mt-0.5">
                    Rate Option Active
                  </div>
                  <div className="text-[10px] text-chocolate-600 dark:text-cream-300">
                    Portion, kg, cake units configured
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-cream-50 dark:bg-chocolate-800/60 border border-gold-500/10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-chocolate-600 dark:text-cream-300">
                    Ratings System
                  </div>
                  <div className="font-bold text-amber-500 text-sm mt-0.5">
                    Customer &amp; Admin ⭐
                  </div>
                  <div className="text-[10px] text-chocolate-600 dark:text-cream-300">
                    1.0 – 5.0 star reviews enabled
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-chocolate-600/60 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-chocolate-800 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-100 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setProductForm({
                    name: '',
                    category: 'Birthday Cakes',
                    price: 950,
                    rateUnit: 'per cake',
                    rating: 5,
                    ratingCount: 1,
                    description: '',
                    image: '',
                    availabilityBadge: 'Baked Fresh Daily',
                    isFeatured: true,
                    ingredients: [],
                    allergens: [],
                  });
                  setAddingProduct(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#3E2723] dark:bg-gold-500 text-white dark:text-chocolate-950 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget({
                    id: 'all',
                    name: 'ALL Products in Catalog',
                    type: 'all-products',
                  })
                }
                className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 rounded-3xl bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-md flex gap-4"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-cream-100 shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 truncate">
                        {product.category}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cream-100 dark:bg-chocolate-800 text-chocolate-700 dark:text-cream-200">
                        {product.availabilityBadge}
                      </span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-chocolate-900 dark:text-cream-50 truncate mt-0.5">
                      {product.name}
                    </h4>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs font-bold text-gold-600 dark:text-gold-400">
                        ₹{product.price}
                        {product.rateUnit && (
                          <span className="text-[10px] font-normal text-chocolate-600 dark:text-cream-300 ml-1">
                            /{product.rateUnit}
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-gold-600 dark:text-gold-400">
                        <Star className="w-3 h-3 fill-gold-400 text-gold-500" />
                        <span>
                          {product.rating !== undefined && product.rating !== null
                            ? Number(product.rating).toFixed(1)
                            : '5.0'}
                        </span>
                        <span className="text-[9px] text-chocolate-600/80 dark:text-cream-300/80 font-normal">
                          ({product.ratingCount || 1})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 pt-2 border-t border-gold-500/10">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(product);
                        setProductForm({
                          ...product,
                          rateUnit: product.rateUnit || 'per portion',
                          rating: product.rating ?? 5,
                          ratingCount: product.ratingCount ?? 1,
                          availabilityBadge:
                            product.availabilityBadge &&
                            product.availabilityBadge.includes('48h')
                              ? 'Made to Order'
                              : product.availabilityBadge || 'In Stock',
                        });
                      }}
                      className="p-1.5 rounded-lg bg-gold-500/20 text-gold-700 dark:text-gold-300 hover:bg-gold-500 hover:text-chocolate-950 transition-colors cursor-pointer"
                      title="Edit Product"
                    >
                      <SquarePen className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateProduct(product.id, { isHidden: !product.isHidden })
                      }
                      className="p-1.5 rounded-lg bg-cream-200 dark:bg-chocolate-800 text-chocolate-800 dark:text-cream-200 hover:bg-gold-400 transition-colors cursor-pointer"
                      title={product.isHidden ? 'Show in store' : 'Hide from store'}
                    >
                      {product.isHidden ? (
                        <EyeOff className="w-3.5 h-3.5 text-rose-500" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateProduct(product.id, {
                          isFeatured: !product.isFeatured,
                        })
                      }
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        product.isFeatured
                          ? 'bg-amber-400 text-chocolate-950'
                          : 'bg-cream-200 text-chocolate-600'
                      }`}
                      title={
                        product.isFeatured ? 'Featured on Home' : 'Not featured'
                      }
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          id: product.id,
                          name: product.name,
                          type: 'product',
                        })
                      }
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer ml-auto"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(addingProduct || editingProduct) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-950/80 backdrop-blur-md">
              <div className="bg-white dark:bg-chocolate-900 rounded-[32px] max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-gold-500/30 space-y-4">
                <h3 className="font-serif text-2xl font-bold text-chocolate-900 dark:text-cream-50">
                  {editingProduct ? 'Edit Product' : 'Add New Bakery Creation'}
                </h3>

                <div className="space-y-4">
                  <ImagePicker
                    label="Product Photo"
                    value={productForm.image || ''}
                    onChange={(val) =>
                      setProductForm({ ...productForm, image: val })
                    }
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={productForm.name || ''}
                        onChange={(e) =>
                          setProductForm({ ...productForm, name: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Price / Rate (₹)
                      </label>
                      <input
                        type="number"
                        value={productForm.price || ''}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Rate Unit
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. per cake, per kg, per 500g, per piece"
                        value={productForm.rateUnit || ''}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            rateUnit: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30 text-xs mb-1.5"
                      />
                      <div className="flex flex-wrap gap-1">
                        {[
                          'per cake',
                          'per kg',
                          'per 500g',
                          'per piece',
                          'per box',
                          'per portion',
                        ].map((unit) => (
                          <button
                            key={unit}
                            type="button"
                            onClick={() =>
                              setProductForm({ ...productForm, rateUnit: unit })
                            }
                            className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                              productForm.rateUnit === unit
                                ? 'bg-gold-500 text-chocolate-950 font-bold border-gold-600'
                                : 'bg-cream-100 dark:bg-chocolate-800 text-chocolate-700 dark:text-cream-300 border-gold-500/20'
                            }`}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold">
                          Product Rating (⭐ 1.0 - 5.0)
                        </label>
                        <span className="text-[10px] text-gold-600 dark:text-gold-400 font-bold">
                          {productForm.rating
                            ? Number(productForm.rating).toFixed(1)
                            : '5.0'}{' '}
                          ⭐
                        </span>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={productForm.rating ?? 5}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            rating: parseFloat(e.target.value) || 5,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30 text-xs"
                      />
                      <div className="flex items-center justify-between text-[10px] text-chocolate-600 dark:text-cream-300 mt-1">
                        <span>Ratings Count:</span>
                        <input
                          type="number"
                          min="1"
                          value={productForm.ratingCount || 1}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              ratingCount: parseInt(e.target.value, 10) || 1,
                            })
                          }
                          className="w-16 px-1.5 py-0.5 rounded border border-gold-500/30 bg-cream-50 dark:bg-chocolate-800 text-right text-[10px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Category
                      </label>
                      <select
                        value={productForm.category || 'Birthday Cakes'}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            category: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30 text-xs"
                      >
                        <option value="Birthday Cakes">Birthday Cakes</option>
                        <option value="Wedding Cakes">Wedding Cakes</option>
                        <option value="Cupcakes">Cupcakes</option>
                        <option value="Cookies">Cookies</option>
                        <option value="Bread">Bread</option>
                        <option value="Pastries">Pastries</option>
                        <option value="Seasonal Specials">Seasonal Specials</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Availability Badge
                      </label>
                      <input
                        type="text"
                        value={productForm.availabilityBadge || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const clean = val.includes('48h')
                            ? 'Made to Order'
                            : val;
                          setProductForm({
                            ...productForm,
                            availabilityBadge: clean,
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30 text-xs mb-1.5"
                      />
                      <div className="flex flex-wrap gap-1">
                        {[
                          'Baked Fresh Daily',
                          'In Stock',
                          'Made to Order',
                          'Seasonal Special',
                        ].map((badge) => (
                          <button
                            key={badge}
                            type="button"
                            onClick={() =>
                              setProductForm({
                                ...productForm,
                                availabilityBadge: badge,
                              })
                            }
                            className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                              productForm.availabilityBadge === badge
                                ? 'bg-gold-500 text-chocolate-950 font-bold border-gold-600'
                                : 'bg-cream-100 dark:bg-chocolate-800 text-chocolate-700 dark:text-cream-300 border-gold-500/20'
                            }`}
                          >
                            {badge}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={productForm.description || ''}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Ingredients (comma separated)
                    </label>
                    <input
                      type="text"
                      value={productForm.ingredients?.join(', ') || ''}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          ingredients: e.target.value
                            .split(',')
                            .map((s) => s.trim()),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Allergens (comma separated)
                    </label>
                    <input
                      type="text"
                      value={productForm.allergens?.join(', ') || ''}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          allergens: e.target.value
                            .split(',')
                            .map((s) => s.trim()),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gold-500/20">
                  <button
                    type="button"
                    onClick={() => {
                      setAddingProduct(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-chocolate-800 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!productForm.name) {
                        showToast('Product name is required');
                        return;
                      }
                      const badge =
                        productForm.availabilityBadge &&
                        productForm.availabilityBadge.includes('48h')
                          ? 'Made to Order'
                          : productForm.availabilityBadge || 'In Stock';
                      const payload: Partial<Product> = {
                        ...productForm,
                        availabilityBadge: badge,
                        rateUnit: productForm.rateUnit || 'per portion',
                        rating:
                          typeof productForm.rating === 'number'
                            ? productForm.rating
                            : Number(productForm.rating) || 5,
                        ratingCount: productForm.ratingCount || 1,
                        ingredients: (productForm.ingredients || [])
                          .map((s) => s.trim())
                          .filter(Boolean),
                        allergens: (productForm.allergens || [])
                          .map((s) => s.trim())
                          .filter(Boolean),
                      };
                      try {
                        if (editingProduct) {
                          await updateProduct(editingProduct.id, payload);
                          showToast('Product updated in database!');
                        } else {
                          await addProduct(payload);
                          showToast('Product created in database!');
                        }
                        setAddingProduct(false);
                        setEditingProduct(null);
                      } catch {
                        showToast('Failed to save product. Check permissions.');
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-gold-500 text-chocolate-950 text-xs font-bold cursor-pointer hover:bg-gold-400 transition-colors"
                  >
                    Save to Database
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search customer or phone..."
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-chocolate-800 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-100"
              />
              <select
                value={inquiryFilter}
                onChange={(e) => setInquiryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-chocolate-800 border border-gold-500/30 text-xs"
              >
                <option value="All">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() =>
                setDeleteTarget({
                  id: 'all',
                  name: 'ALL Special Order Inquiries',
                  type: 'all-special-orders',
                })
              }
              className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-600 text-xs font-bold hover:bg-rose-500 hover:text-white transition-colors"
            >
              Clear All Inquiries
            </button>
          </div>

          {filteredInquiries.length === 0 ? (
            <p className="text-xs text-chocolate-600 py-8 text-center">
              No inquiries match your criteria.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredInquiries.map((order) => (
                <div
                  key={order.id}
                  className="p-6 rounded-3xl bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-md space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gold-500/15 pb-3">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-chocolate-900 dark:text-cream-50">
                        {order.customerName}
                      </h4>
                      <p className="text-xs text-chocolate-600 dark:text-cream-300">
                        Phone:{' '}
                        <strong className="text-chocolate-900 dark:text-cream-100">
                          {order.phone}
                        </strong>
                        {order.email && ` • Email: ${order.email}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={(order.status || 'pending').toLowerCase()}
                        onChange={async (e) => {
                          try {
                            await updateInquiryStatus(order.id, e.target.value);
                            showToast('Inquiry status updated!');
                          } catch {
                            showToast('Failed to update status.');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cream-100 dark:bg-chocolate-800 border border-gold-500/30"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            id: order.id,
                            name: `Inquiry from ${order.customerName}`,
                            type: 'special-order',
                          })
                        }
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-chocolate-600 block">
                        Occasion &amp; Guests
                      </span>
                      <p className="font-semibold text-chocolate-900 dark:text-cream-100">
                        {order.occasion} • {order.servingSize}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-chocolate-600 block">
                        Preferred Date
                      </span>
                      <p className="font-semibold text-chocolate-900 dark:text-cream-100">
                        {order.preferredDate || 'Flexible'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-chocolate-600 block">
                        Dietary Requirements
                      </span>
                      <p className="font-semibold text-chocolate-900 dark:text-cream-100">
                        {order.specialRequirements || 'None specified'}
                      </p>
                    </div>
                  </div>

                  {order.message && (
                    <div className="p-3 rounded-2xl bg-cream-50 dark:bg-chocolate-800/50 text-xs text-chocolate-800 dark:text-cream-100">
                      <strong>Design Vision:</strong> {order.message}
                    </div>
                  )}

                  {order.referenceImage && (
                    <div className="pt-2 flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-gold-400 shrink-0">
                        <img
                          src={order.referenceImage}
                          alt="Customer Reference"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewImage(order.referenceImage || null)}
                        className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Full Reference Photo</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                setGalleryForm({
                  title: '',
                  category: 'Cakes',
                  imageUrl: '',
                  description: '',
                });
                setAddingGallery(true);
              }}
              className="px-4 py-2 rounded-xl bg-gold-500 text-chocolate-950 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Gallery Image</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setDeleteTarget({
                  id: 'all',
                  name: 'ALL Gallery Images',
                  type: 'all-gallery',
                })
              }
              className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-600 text-xs font-bold hover:bg-rose-500 hover:text-white transition-colors"
            >
              Clear All Gallery
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {siteData.gallery.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-gold-500/20 shadow-sm"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-chocolate-950/70 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between text-white">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gold-300">
                      {item.category}
                    </span>
                    <h5 className="font-serif text-xs font-bold">{item.title}</h5>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGallery(item);
                        setGalleryForm(item);
                      }}
                      className="p-1 rounded bg-white/20 hover:bg-white/40"
                    >
                      <SquarePen className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          id: item.id,
                          name: item.title,
                          type: 'gallery',
                        })
                      }
                      className="p-1 rounded bg-rose-500/80 hover:bg-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(addingGallery || editingGallery) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-950/80 backdrop-blur-md">
              <div className="bg-white dark:bg-chocolate-900 rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gold-500/30 space-y-4">
                <h3 className="font-serif text-2xl font-bold text-chocolate-900 dark:text-cream-50">
                  {editingGallery ? 'Edit Gallery Item' : 'Add Showcase Image'}
                </h3>
                <ImagePicker
                  label="Showcase Image"
                  value={galleryForm.imageUrl || ''}
                  onChange={(val) =>
                    setGalleryForm({ ...galleryForm, imageUrl: val })
                  }
                />
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={galleryForm.title || ''}
                    onChange={(e) =>
                      setGalleryForm({ ...galleryForm, title: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={galleryForm.category || 'Cakes'}
                    onChange={(e) =>
                      setGalleryForm({ ...galleryForm, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30 text-xs"
                  >
                    <option value="Cakes">Cakes</option>
                    <option value="Cookies">Cookies</option>
                    <option value="Bread">Bread</option>
                    <option value="Pastries">Pastries</option>
                    <option value="Events">Events</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAddingGallery(false);
                      setEditingGallery(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-chocolate-800 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!galleryForm.imageUrl) {
                        showToast('Image is required');
                        return;
                      }
                      try {
                        if (editingGallery) {
                          await updateGalleryItem(editingGallery.id, galleryForm);
                          showToast('Gallery image updated!');
                        } else {
                          await addGalleryItem(galleryForm);
                          showToast('Gallery image added!');
                        }
                        setAddingGallery(false);
                        setEditingGallery(null);
                      } catch {
                        showToast('Failed to save gallery image.');
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-gold-500 text-chocolate-950 text-xs font-bold"
                  >
                    Save Photo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'hours' && (
        <div className="space-y-6 max-w-2xl">
          <div className="border-b border-gold-500/20 pb-4">
            <h2 className="font-serif text-2xl font-bold text-chocolate-900 dark:text-cream-50">
              Counter Hours of Operation
            </h2>
            <p className="text-xs text-chocolate-600 dark:text-cream-300">
              Configure open times and closed days shown in the footer and home
              page.
            </p>
          </div>
          <div className="space-y-3">
            {hoursForm.map((h, idx) => (
              <div
                key={h.day}
                className="p-4 rounded-2xl bg-white/50 dark:bg-chocolate-900/60 border border-gold-500/20 flex items-center justify-between gap-4 text-xs"
              >
                <span className="font-bold text-chocolate-900 dark:text-cream-50 w-28">
                  {h.day}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    disabled={h.isClosed}
                    value={h.openTime}
                    onChange={(e) => {
                      const next = [...hoursForm];
                      next[idx] = { ...next[idx], openTime: e.target.value };
                      setHoursForm(next);
                    }}
                    className="w-24 px-2 py-1.5 rounded-lg bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30 text-center"
                  />
                  <span>-</span>
                  <input
                    type="text"
                    disabled={h.isClosed}
                    value={h.closeTime}
                    onChange={(e) => {
                      const next = [...hoursForm];
                      next[idx] = { ...next[idx], closeTime: e.target.value };
                      setHoursForm(next);
                    }}
                    className="w-24 px-2 py-1.5 rounded-lg bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30 text-center"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={h.isClosed}
                    onChange={(e) => {
                      const next = [...hoursForm];
                      next[idx] = { ...next[idx], isClosed: e.target.checked };
                      setHoursForm(next);
                    }}
                    className="w-4 h-4 rounded text-gold-500"
                  />
                  <span className="text-xs font-semibold">Closed</span>
                </label>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={async () => {
              await updateBusinessHours(hoursForm);
              showToast('Business hours updated successfully!');
            }}
            className="px-6 py-2.5 rounded-xl bg-gold-500 text-chocolate-950 font-bold text-xs shadow-md"
          >
            Save Business Hours
          </button>
        </div>
      )}

      {activeTab === 'directions' && (
        <div className="space-y-6 max-w-2xl text-xs">
          <div className="border-b border-gold-500/20 pb-4">
            <h2 className="font-serif text-2xl font-bold text-chocolate-900 dark:text-cream-50">
              Store Pickup Guide &amp; Map Settings
            </h2>
            <p className="text-xs text-chocolate-600 dark:text-cream-300">
              Customize the map embed, directions link, landmark, and step-by-step
              counter collection guide.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Bakery Address</label>
              <input
                type="text"
                value={directionsForm.address}
                onChange={(e) =>
                  setDirectionsForm({ ...directionsForm, address: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Landmark</label>
              <input
                type="text"
                value={directionsForm.landmark}
                onChange={(e) =>
                  setDirectionsForm({ ...directionsForm, landmark: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">
                Transit &amp; Parking Guide
              </label>
              <textarea
                rows={2}
                value={directionsForm.transportGuide}
                onChange={(e) =>
                  setDirectionsForm({
                    ...directionsForm,
                    transportGuide: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30"
              />
            </div>
            <button
              type="button"
              onClick={async () => {
                await updateStoreDirections(directionsForm);
                showToast('Store directions updated!');
              }}
              className="px-6 py-2.5 rounded-xl bg-gold-500 text-chocolate-950 font-bold text-xs"
            >
              Save Directions Guide
            </button>
          </div>
        </div>
      )}

      {activeTab === 'testimonials' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl font-bold text-chocolate-900 dark:text-cream-50">
              Customer Reviews ({siteData.testimonials.length})
            </h3>
            <button
              type="button"
              onClick={() =>
                setDeleteTarget({
                  id: 'all',
                  name: 'ALL Customer Reviews',
                  type: 'all-testimonials',
                })
              }
              className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-600 text-xs font-bold hover:bg-rose-500 hover:text-white"
            >
              Clear All Reviews
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {siteData.testimonials.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-3xl bg-white/50 dark:bg-chocolate-900/60 border border-gold-500/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-chocolate-900 dark:text-cream-50">
                    {t.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateTestimonialApproval(t.id, !t.isApproved)
                      }
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.isApproved
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-500/20 text-amber-700'
                      }`}
                    >
                      {t.isApproved ? 'Approved' : 'Pending Approval'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          id: t.id,
                          name: `Review by ${t.name}`,
                          type: 'testimonial',
                        })
                      }
                      className="p-1 text-rose-600 hover:bg-rose-500/10 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-chocolate-800 dark:text-cream-200 italic">
                  &quot;{t.comment}&quot;
                </p>
                <div className="text-[10px] text-chocolate-600 flex justify-between">
                  <span>Rating: {t.rating} / 5 Stars</span>
                  <span>{t.occasion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-2xl text-xs">
          <div className="border-b border-gold-500/20 pb-4">
            <h2 className="font-serif text-2xl font-bold text-chocolate-900 dark:text-cream-50">
              General Website Settings
            </h2>
            <p className="text-xs text-chocolate-600 dark:text-cream-300">
              Modify brand name, phone, logo, pickup notice banner, and SEO
              configurations.
            </p>
          </div>

          <ImagePicker
            label="Official Bakery Brand Logo"
            value={settingsForm.logoUrl || ''}
            onChange={(val) => setSettingsForm({ ...settingsForm, logoUrl: val })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Bakery Name</label>
              <input
                type="text"
                value={settingsForm.siteName || ''}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, siteName: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={settingsForm.phone || ''}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, phone: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Store Address</label>
            <input
              type="text"
              value={settingsForm.address || ''}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, address: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30"
            />
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/15 border border-gold-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-amber-900 dark:text-gold-200">
                Mandatory Store Pickup Notice
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!settingsForm.showPickupBanner}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      showPickupBanner: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-gold-500"
                />
                <span className="font-semibold text-[11px]">Show Banner</span>
              </label>
            </div>
            <textarea
              rows={2}
              value={settingsForm.pickupNotice || ''}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, pickupNotice: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-chocolate-800 border border-gold-500/30 font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">SEO Title Tag</label>
              <input
                type="text"
                value={settingsForm.seoTitle || ''}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, seoTitle: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">
                SEO Description Tag
              </label>
              <input
                type="text"
                value={settingsForm.seoDescription || ''}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    seoDescription: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={async () => {
                try {
                  await updateSettings(settingsForm);
                  showToast('Website settings saved!');
                } catch {
                  showToast('Failed to save settings.');
                }
              }}
              className="px-6 py-2.5 rounded-xl bg-gold-500 text-chocolate-950 font-bold text-xs shadow-md"
            >
              Save Settings
            </button>
            <button
              type="button"
              onClick={() => setConfirmResetType('default')}
              className="px-4 py-2.5 rounded-xl bg-cream-200 dark:bg-chocolate-800 text-chocolate-800 dark:text-cream-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>

          <div className="pt-8 border-t border-rose-500/30 space-y-3">
            <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm">Danger Zone: Wipe All Website Data</span>
              </div>
              <p className="text-chocolate-700 dark:text-cream-200">
                Permanently delete all catalog products, gallery photos, customer
                reviews, and special order inquiries at once.
              </p>
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget({
                    id: 'all',
                    name: 'ALL Catalog Products, Gallery Photos, Customer Reviews, and Special Order Inquiries',
                    type: 'all-data',
                  })
                }
                id="admin-delete-all-data-btn"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Wipe All Website Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6 text-xs max-w-md">
          <div className="border-b border-gold-500/20 pb-4">
            <h2 className="font-serif text-2xl font-bold text-chocolate-900 dark:text-cream-50">
              Security &amp; Credentials
            </h2>
            <p className="text-xs text-chocolate-600 dark:text-cream-300">
              Change admin username and login password.
            </p>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (adminNewPassword.length < 6) {
                showToast('Password must be at least 6 characters');
                return;
              }
              try {
                localStorage.setItem(
                  'liyas_admin_saved_creds',
                  JSON.stringify({
                    username: adminUsername,
                    password: adminNewPassword,
                  })
                );
              } catch {
                // ignore storage errors
              }
              updateAdminInfo({ username: adminUsername, isFirstLogin: false });
              try {
                await fetch('/api/auth/change-password', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    username: adminUsername,
                    newPassword: adminNewPassword,
                  }),
                });
              } catch {
                // ignore
              }
              showToast('Admin credentials updated successfully!');
              setAdminNewPassword('');
            }}
            className="space-y-4"
          >
            <div>
              <label className="block font-semibold mb-1">Admin Username</label>
              <input
                type="text"
                required
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">
                New Password (Min 6 chars)
              </label>
              <input
                type="password"
                required
                placeholder="Enter new password"
                value={adminNewPassword}
                onChange={(e) => setAdminNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gold-500 text-chocolate-950 font-bold text-xs"
            >
              Update Credentials
            </button>
          </form>
        </div>
      )}

      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="p-6 rounded-[32px] bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold-500/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Compulsory Database Engine Online
                </span>
                <h3 className="font-serif text-2xl font-bold text-chocolate-900 dark:text-cream-50">
                  Database &amp; Persistent Storage
                </h3>
                <p className="text-xs text-chocolate-600 dark:text-cream-300 mt-1">
                  JSON-backed transactional database storing all products, rates,
                  ratings, inquiries, reviews, and site configs.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await refreshDatabaseStatus();
                    showToast('Database status refreshed!');
                  }}
                  className="px-4 py-2 rounded-xl bg-gold-500/20 hover:bg-gold-500 text-gold-700 hover:text-chocolate-950 dark:text-gold-300 dark:hover:text-chocolate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Status</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const dataStr =
                      'data:text/json;charset=utf-8,' +
                      encodeURIComponent(JSON.stringify(siteData, null, 2));
                    const a = document.createElement('a');
                    a.setAttribute('href', dataStr);
                    a.setAttribute(
                      'download',
                      `artisan-bakery-db-backup-${new Date()
                        .toISOString()
                        .slice(0, 10)}.json`
                    );
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    showToast('Database JSON backup downloaded!');
                  }}
                  className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-chocolate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-cream-50 dark:bg-chocolate-800/60 border border-gold-500/15 space-y-1">
                <div className="flex items-center justify-between text-gold-600 dark:text-gold-400 text-xs font-bold">
                  <span>Firebase Firestore</span>
                  <Database className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-chocolate-900 dark:text-cream-50">
                  {firebaseConnected ? 'Cloud Firestore Ready' : 'Local Fallback + Sync'}
                </div>
                <div className="text-[10px] text-chocolate-600 dark:text-cream-300 font-mono truncate">
                  {databaseStats?.firebase?.databaseId || 'Cloud Firestore'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 dark:bg-chocolate-800/60 border border-gold-500/15 space-y-1">
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <span>Connection Status</span>
                  <Server className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {firestoreSynced
                    ? 'Firestore Live Synced'
                    : isFirebaseAdmin
                    ? 'Authenticated (Ready)'
                    : 'Active & Syncing'}
                </div>
                <div className="text-[10px] text-chocolate-600 dark:text-cream-300 truncate">
                  {firebaseUser?.email
                    ? `Signed in: ${firebaseUser.email}`
                    : databaseStats?.fileSizeFormatted
                    ? `${databaseStats.fileSizeFormatted} local + cloud`
                    : 'Compulsory Ready'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 dark:bg-chocolate-800/60 border border-gold-500/15 space-y-1">
                <div className="flex items-center justify-between text-amber-500 text-xs font-bold">
                  <span>Order Lead Rule</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-sm font-bold text-chocolate-900 dark:text-cream-50">
                  No 48h Requirement
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Strictly Enforced Removed
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 dark:bg-chocolate-800/60 border border-gold-500/15 space-y-1">
                <div className="flex items-center justify-between text-gold-600 dark:text-gold-400 text-xs font-bold">
                  <span>Ratings &amp; Rates</span>
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                </div>
                <div className="text-sm font-bold text-chocolate-900 dark:text-cream-50">
                  Rate &amp; Rating Active
                </div>
                <div className="text-[10px] text-chocolate-600 dark:text-cream-300">
                  Customer &amp; Admin Inputs
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-md space-y-4">
              <h4 className="font-serif text-lg font-bold text-chocolate-900 dark:text-cream-50 flex items-center gap-2">
                <Database className="w-5 h-5 text-gold-500" />
                <span>Active Database Records</span>
              </h4>
              <div className="divide-y divide-gold-500/10 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-chocolate-700 dark:text-cream-200">
                    Total Products in Catalog
                  </span>
                  <span className="font-bold text-chocolate-900 dark:text-cream-50 font-mono">
                    {siteData.products.length} records
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-chocolate-700 dark:text-cream-200">
                    Customer Inquiries &amp; Orders
                  </span>
                  <span className="font-bold text-chocolate-900 dark:text-cream-50 font-mono">
                    {siteData.specialOrders.length} records
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-chocolate-700 dark:text-cream-200">
                    Gallery Showcase Items
                  </span>
                  <span className="font-bold text-chocolate-900 dark:text-cream-50 font-mono">
                    {siteData.gallery.length} records
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-chocolate-700 dark:text-cream-200">
                    Customer Testimonials
                  </span>
                  <span className="font-bold text-chocolate-900 dark:text-cream-50 font-mono">
                    {siteData.testimonials.length} records
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-chocolate-700 dark:text-cream-200">
                    Last Disk Write
                  </span>
                  <span className="font-bold text-chocolate-900 dark:text-cream-50 font-mono text-[11px]">
                    {databaseStats?.lastUpdated
                      ? new Date(databaseStats.lastUpdated).toLocaleTimeString()
                      : databaseStats?.stats?.lastSaved
                      ? new Date(databaseStats.stats.lastSaved).toLocaleTimeString()
                      : 'Current Session'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-md space-y-4">
              <h4 className="font-serif text-lg font-bold text-chocolate-900 dark:text-cream-50 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-500" />
                <span>Database Integrity Rules</span>
              </h4>
              <ul className="space-y-3 text-xs text-chocolate-700 dark:text-cream-200 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>No &quot;Order 48h Ahead&quot;:</strong> Filtered and
                    sanitized both client-side and server-side across all creation
                    and update operations.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Rate Option &amp; Units:</strong> Products support custom
                    rates and flexible rate units (e.g., per cake, per kg, per 500g,
                    per piece).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Interactive Rating System:</strong> Real-time customer
                    5-star submissions with weighted averaging and manual admin
                    overrides.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Persistent File Storage:</strong> Database writes persist
                    across server restarts inside the dedicated container storage.
                  </span>
                </li>
              </ul>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmResetType('compulsory')}
                  className="w-full py-2.5 px-4 rounded-xl bg-gold-500/15 hover:bg-gold-500 text-gold-800 hover:text-chocolate-950 dark:text-gold-300 dark:hover:text-chocolate-950 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-gold-500/30"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-seed Clean Menu Database</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-950/70 backdrop-blur-md">
          <div className="bg-white dark:bg-chocolate-900 border-2 border-rose-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-chocolate-900 dark:text-cream-50">
                  {deleteTarget.type.startsWith('all-')
                    ? 'Confirm Bulk Delete All?'
                    : `Delete ${
                        deleteTarget.type === 'product'
                          ? 'Product'
                          : deleteTarget.type === 'gallery'
                          ? 'Gallery Image'
                          : deleteTarget.type === 'testimonial'
                          ? 'Review'
                          : 'Inquiry'
                      }?`}
                </h3>
                <p className="text-xs text-chocolate-600 dark:text-cream-300">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-chocolate-800 dark:text-cream-100 font-sans leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-rose-700 dark:text-rose-300 font-bold">
                &quot;{deleteTarget.name}&quot;
              </strong>
              ?{' '}
              {deleteTarget.type.startsWith('all-')
                ? 'All items in this collection will be cleared immediately.'
                : 'It will be removed from your store immediately.'}
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-gold-500/20">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-chocolate-800 text-chocolate-800 dark:text-cream-100 text-xs font-bold hover:bg-gray-300 dark:hover:bg-chocolate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-action-btn"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmResetType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-950/70 backdrop-blur-md">
          <div className="bg-white dark:bg-chocolate-900 border-2 border-gold-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-gold-500/30">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-chocolate-900 dark:text-cream-50">
                  {confirmResetType === 'default'
                    ? 'Reset Website to Default Data?'
                    : 'Re-seed Clean Menu Database?'}
                </h3>
                <p className="text-xs text-chocolate-600 dark:text-cream-300">
                  This restores all default artisanal bakery items.
                </p>
              </div>
            </div>
            <p className="text-xs text-chocolate-800 dark:text-cream-200 leading-relaxed">
              {confirmResetType === 'default'
                ? 'This will restore the default sample products, gallery showcase, customer testimonials, and store configuration.'
                : 'This will reset and re-seed the database with clean artisanal products, pricing rates, and zero 48h strings.'}
            </p>
            <div className="flex justify-end gap-2.5 pt-2 border-t border-gold-500/20">
              <button
                type="button"
                onClick={() => setConfirmResetType(null)}
                disabled={resetting}
                className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-chocolate-800 text-chocolate-800 dark:text-cream-100 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={resetting}
                className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-chocolate-950 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{resetting ? 'Restoring...' : 'Confirm Reset'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-950/85 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-chocolate-900 rounded-3xl overflow-hidden border border-gold-500/40 p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="w-full py-2 mb-2 rounded-xl bg-chocolate-800 hover:bg-gold-500 hover:text-chocolate-950 text-cream-100 text-xs font-bold cursor-pointer transition-colors"
            >
              Close Reference Photo
            </button>
            <img
              src={previewImage}
              alt="Customer Reference Full View"
              className="w-full max-h-[75vh] object-contain rounded-2xl bg-black"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
