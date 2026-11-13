export interface SiteSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  phone: string;
  email: string;
  address: string;
  googleMapsUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  pinterestUrl: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  pickupNotice: string;
  showPickupBanner?: boolean;
  maintenanceMode: boolean;
  visitCount: number;
}

export interface HomepageData {
  heroImage: string;
  heroTitle: string;
  tagline: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeStory: string;
  ctaText1: string;
  ctaText2: string;
  featuredSectionTitle: string;
  pickupNotice: string;
}

export interface Baker {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface Milestone {
  year: string;
  title: string;
  description: string;
}

export interface AboutData {
  storyTitle: string;
  storyParagraphs: string[];
  mission: string;
  vision: string;
  bakers: Baker[];
  timeline: Milestone[];
  qualityPromises: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rateUnit: string;
  rating: number;
  ratingCount: number;
  description: string;
  image: string;
  availabilityBadge: string;
  isFeatured: boolean;
  isHidden: boolean;
  ingredients: string[];
  allergens: string[];
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description?: string;
  uploadDate?: string;
}

export interface Testimonial {
  id: string;
  authorUid?: string;
  name: string;
  rating: number;
  comment: string;
  occasion: string;
  date: string;
  isApproved: boolean;
}

export interface BusinessHour {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface SpecialOrder {
  id: string;
  userId?: string;
  customerName: string;
  phone: string;
  email?: string;
  occasion: string;
  preferredDate: string;
  servingSize: string;
  message: string;
  specialRequirements?: string;
  referenceImage?: string;
  status: string;
  createdAt: string;
}

export interface StoreDirections {
  address: string;
  landmark: string;
  googleMapsUrl: string;
  mapEmbedUrl: string;
  transportGuide: string;
}

export interface ProductRating {
  id: string;
  productId: string;
  authorUid?: string;
  rating: number;
  customerName: string;
  comment?: string;
  createdAt: string;
}

export interface SiteData {
  settings: SiteSettings;
  homepage: HomepageData;
  about: AboutData;
  products: Product[];
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  businessHours: BusinessHour[];
  specialOrders: SpecialOrder[];
  storeDirections: StoreDirections;
  productRatings?: ProductRating[];
  lastUpdated?: string;
}

export interface DatabaseStatus {
  status: string;
  type: string;
  storagePath: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  totalProducts: number;
  totalRatings: number;
  totalSpecialOrders: number;
  totalGallery: number;
  totalTestimonials: number;
  lastUpdated: string;
  stats?: {
    fileSizeKB?: string;
    lastSaved?: string;
  };
  firebase?: {
    connected: boolean;
    projectId: string;
    databaseId: string;
    synced: boolean;
    authEmail?: string | null;
  };
}

export interface AdminStats {
  totalProducts: number;
  totalGallery: number;
  totalTestimonials: number;
  pendingOrders: number;
  totalOrders: number;
  visitCount: number;
  database?: DatabaseStatus;
}
