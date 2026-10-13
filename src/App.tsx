import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  ChevronRight,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Lock,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Award,
  Layers,
  Edit,
  Eye,
  EyeOff,
  Upload,
  Save,
  LogOut,
  Key,
  Instagram,
  MessageCircle,
  AlertCircle,
  FileText,
  Palette,
  Percent,
  SlidersHorizontal,
  FolderPlus
} from 'lucide-react';

/* Razorpay global declaration */
declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface ProductColor {
  name: string;
  hex: string;
  images?: string[]; // Multiple photos specific to this shade
}

export interface Product {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  isBestseller: boolean;
  isNew: boolean;
  isPublished?: boolean;
  stock: number;
  colors: ProductColor[];
  sizes: string[];
  variantStock?: Record<string, number>; // key: `${colorName}_${size}`, value: number
  fabric: string;
  craft: string;
  leadTime: string;
  description: string;
  image: string;
  additionalImages?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Announcement {
  id: string;
  text: string;
  linkText?: string;
  linkUrl?: string;
  isActive: boolean;
  order: number;
}

export interface CategoryCard {
  key: string;
  title: string;
  subtitle: string;
  description?: string;
  img: string;
  subcategories?: string[];
  order?: number;
}

export interface StoreSettings {
  whatsappNumber: string;
  instagramHandle: string;
  instagramUrl: string;
  flagshipAddress: string;
  contactEmail: string;
  contactPhone: string;
  shippingTamilNadu: number; // default: 50
  shippingPanIndia: number;  // default: 100
  gstRate: number;           // default: 12 (%)
  gstPricingMode: 'inclusive' | 'exclusive'; // default: 'inclusive'
  currency: string;
  brandDisplayName?: string;
  brandSubtitle?: string;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayKeySecretMasked?: string;
  isRazorpayConfigured?: boolean;
  gatewayMode?: 'test' | 'live';
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface HeroContent {
  kicker: string;
  headline: string;
  headlineItalic: string;
  description: string;
  bgImage: string;
  cta1Text: string;
  cta1Category: string;
  cta2Text: string;
  cta2Category: string;
  stats: HeroStat[];
}

export interface AboutPromise {
  title: string;
  desc: string;
}

export interface AboutContent {
  kicker: string;
  headline: string;
  storyParagraphs: string[];
  guildTitle: string;
  guildDesc: string;
  guildImg: string;
  promises: AboutPromise[];
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  city: string;
  rating: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  description: string;
  isActive: boolean;
}

export interface PoliciesContent {
  shippingHeading: string;
  shippingText: string;
  shippingPoints: string[];
  returnsHeading: string;
  returnsText: string;
  returnsPoints: string[];
  privacyHeading: string;
  privacyText: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface DetailedCartItem extends CartItem {
  product: Product;
  totalItemPrice: number;
}

export interface CheckoutFormState {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: 'razorpay'; // NO COD
}

export interface ConfirmedOrder {
  orderId: string;
  date: string;
  items: any[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  gstAmount: number;
  shippingCharge: number;
  grandTotal: number;
  customer: CheckoutFormState;
  paymentMethod: 'razorpay';
  paymentStatus: string;
  fulfillmentStatus: string;
  razorpayPaymentId?: string;
}

const INDIAN_STATES: string[] = [
  'Tamil Nadu', 'Delhi NCR', 'Karnataka', 'Maharashtra', 'Telangana',
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jammu & Kashmir', 'Jharkhand', 'Kerala', 'Madhya Pradesh',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function App() {
  /* Navigation & View States */
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  /* Catalogue & Dynamic Site Content States */
  const [products, setProducts] = useState<Product[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [categoriesContent, setCategoriesContent] = useState<CategoryCard[]>([
    {
      key: 'kurtis',
      title: 'Festive Kurti Sets',
      subtitle: 'Chanderi & Hand Block',
      description: 'Bespoke calf-length straight silhouettes and scalloped organza dupattas.',
      img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
      subcategories: ['Chanderi Sets', 'A-Line Tunics', 'Hand Block Co-ords'],
      order: 1
    },
    {
      key: 'dresses',
      title: 'Anarkalis & Indo-Western Gowns',
      subtitle: 'Organza & Micro-Pearls',
      description: 'Floor-sweeping flared silhouettes with delicate zardozi detailing.',
      img: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80',
      subcategories: ['32-Kali Anarkalis', 'Festive Gowns', 'Cocktail Capes'],
      order: 2
    },
    {
      key: 'ethnic',
      title: 'Bridal Heritage Lehengas',
      subtitle: 'Velvet & Heritage Dabka',
      description: 'Royal bridal couture crafted with micro velvet and double organza veils.',
      img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
      subcategories: ['Velvet Lehengas', 'Bridal Ensembles', 'Sangeet Silhouettes'],
      order: 3
    },
    {
      key: 'festive',
      title: 'Atelier Festive Drapes & Sets',
      subtitle: 'Metallic Tissue & Brocades',
      description: 'Occasion curations blending antique zari and artisanal weaving.',
      img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
      subcategories: ['Festive Brocades', 'Occasion Drapes', 'Bespoke Sets'],
      order: 4
    }
  ]);

  const [heroContent, setHeroContent] = useState<HeroContent>({
    kicker: 'HAUTE COUTURE OF SOUTH ASIA',
    headline: 'Woven in Heritage,',
    headlineItalic: 'Draped in Royalty.',
    description: 'Handcrafted festive co-ords, flared organza Anarkalis, and bespoke bridal lehengas crafted by master generational artisans across India.',
    bgImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=80',
    cta1Text: 'Explore Festive Collection',
    cta1Category: 'all',
    cta2Text: 'Festive Kurti Sets',
    cta2Category: 'kurtis',
    stats: [
      { value: '100%', label: 'Artisan Authenticity' },
      { value: '250+', label: 'Artisan Families' },
      { value: 'Insured', label: 'Pan-India Express' }
    ]
  });

  const [aboutContent, setAboutContent] = useState<AboutContent>({
    kicker: 'The Dhasami Promise',
    headline: 'Crafted not just for special moments, but to be passed down through generations.',
    storyParagraphs: [
      'Founded in Chennai, Tamil Nadu, Dhasami Couture was born from an ardent reverie: to preserve the slow, poetic rhythm of Indian textile weaving while curating silhouettes designed for the contemporary global woman.',
      'The name Dhasami celebrates auspicious festive occasions, new beginnings, and ancestral radiance. Each piece in our boutique undergoes months of meticulous curation—from the selection of pure mulberry silk threads in Varanasi to the precision of gotta-kinari embroideries by artisan guilds in Jaipur.'
    ],
    guildTitle: 'Generational Weaving Guilds',
    guildDesc: 'Preserving 400-year-old Jacquard & Kadhwa weaving traditions across India.',
    guildImg: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80',
    promises: [
      { title: 'Authentic Handloom', desc: 'Every ensemble is verified for artisanal weaving and genuine natural materials.' },
      { title: 'Direct From Weavers', desc: 'Fair compensation and artisan guild welfare directly supported through every patronage.' },
      { title: 'Bespoke Fit', desc: 'In-house master tailors provide customized falls, borders, and blouse measurements prior to sealing.' }
    ]
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [policiesContent, setPoliciesContent] = useState<PoliciesContent>({
    shippingHeading: '1. Shipping & Pan-India Insured Dispatch',
    shippingText: 'All Dhasami Couture orders are dispatched from our primary Chennai ateliers through insured premium courier partners (BlueDart, Delhivery, DTDC).',
    shippingPoints: [
      'Tamil Nadu orders: ₹50 express shipping charge (2 to 3 business days).',
      'Pan-India orders (all other Indian states): ₹100 express insured delivery (3 to 5 business days).',
      'Real-time parcel tracking provided via WhatsApp and SMS upon courier dispatch.'
    ],
    returnsHeading: '2. 7-Day Exchange & Returns Policy',
    returnsText: 'We take immense pride in our artisan handloom standards. If an ensemble does not fit or satisfy your expectations:',
    returnsPoints: [
      'You may request an exchange or boutique credit within 7 calendar days of delivery.',
      'Items must remain unused, unworn, unwashed with original designer tags intact.',
      'Custom-tailored blouses or bespoke alterations are final sale unless a manufacturing discrepancy is confirmed.'
    ],
    privacyHeading: '3. Privacy & Secure Online Payment Architecture',
    privacyText: 'Dhasami Couture strictly adheres to Indian Information Technology (IT Act 2000) privacy protocols. All online orders require secure prepayment via Razorpay (UPI, Credit/Debit cards, NetBanking). We do not accept Cash on Delivery to guarantee artisan reservation and prevent fraudulent parcel returns.'
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    whatsappNumber: '919840123456',
    instagramHandle: 'dhasamicouture',
    instagramUrl: 'https://instagram.com/dhasamicouture',
    flagshipAddress: '42, Chamiers Road, R.A. Puram, Chennai, Tamil Nadu 600028',
    contactEmail: 'concierge@dhasamicouture.com',
    contactPhone: '+91 98401 23456 / 044-2435-0099',
    shippingTamilNadu: 50,
    shippingPanIndia: 100,
    gstRate: 12,
    gstPricingMode: 'inclusive',
    currency: 'INR',
    brandDisplayName: 'Dhasami Couture',
    brandSubtitle: 'HAUTE COUTURE · CHENNAI',
    gatewayMode: 'test'
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [priceMax, setPriceMax] = useState<number>(60000);

  /* Cart & Wishlist States */
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dc_cart');
      return saved ? JSON.parse(saved) : [{ productId: 'DC-102', quantity: 1, selectedSize: 'M', selectedColor: 'Emerald Forest' }];
    } catch {
      return [{ productId: 'DC-102', quantity: 1, selectedSize: 'M', selectedColor: 'Emerald Forest' }];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dc_wishlist');
      return saved ? JSON.parse(saved) : ['DC-101'];
    } catch {
      return ['DC-101'];
    }
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState<boolean>(false);

  /* Checkout Form State — Online Razorpay Only (NO COD) */
  const [checkoutData, setCheckoutData] = useState<CheckoutFormState>({
    fullName: 'Ananya Subramanian',
    email: 'ananya.s@example.com',
    phone: '9840123456',
    addressLine1: 'Flat 4B, Rajendra Elegance, TTK Road',
    addressLine2: 'Alwarpet',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600018',
    paymentMethod: 'razorpay'
  });

  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  /* Admin Security & Dashboard State */
  const [adminToken, setAdminToken] = useState<string>(() => sessionStorage.getItem('dc_admin_token') || '');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<
    'products' | 'categories' | 'orders' | 'shipping-tax' | 'announcements' | 'hero' | 'about' | 'testimonials' | 'coupons' | 'policies' | 'settings' | 'gateway' | 'security'
  >('products');
  const [adminLoginForm, setAdminLoginForm] = useState({ email: 'owner@dhasamicouture.com', password: '' });
  const [adminLoginError, setAdminLoginError] = useState<string>('');
  const [adminOrders, setAdminOrders] = useState<any[]>([]);

  /* In-page Owner Controls Modal States */
  const [isOwnerLoginModalOpen, setIsOwnerLoginModalOpen] = useState<boolean>(false);
  const [isOwnerQuickMenuOpen, setIsOwnerQuickMenuOpen] = useState<boolean>(false);

  /* Admin Editing Modals & Forms */
  const [isEditingProductModal, setIsEditingProductModal] = useState<boolean>(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    category: 'kurtis',
    categoryLabel: 'Festive Kurti Sets',
    price: 4999,
    originalPrice: 6500,
    rating: 5.0,
    reviewsCount: 1,
    isBestseller: false,
    isNew: true,
    isPublished: true,
    stock: 5,
    colors: [
      { name: 'Heritage Crimson', hex: '#8B1E3F', images: [] }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    variantStock: {},
    fabric: 'Pure Chanderi Silk Blend',
    craft: 'Handcrafted Gotta Patti & Zari',
    leadTime: 'Ready to dispatch within 24 hours',
    description: '',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
    additionalImages: []
  });

  /* Category Modal State */
  const [isEditingCategoryModal, setIsEditingCategoryModal] = useState<boolean>(false);
  const [categoryForm, setCategoryForm] = useState<Partial<CategoryCard>>({
    key: '',
    title: '',
    subtitle: '',
    description: '',
    img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    subcategories: [],
    order: 1
  });
  const [subcategoryInput, setSubcategoryInput] = useState<string>('');

  const [newAnnouncementText, setNewAnnouncementText] = useState<string>('');
  const [heroForm, setHeroForm] = useState<HeroContent>(heroContent);
  const [aboutForm, setAboutForm] = useState<AboutContent>(aboutContent);
  const [policiesForm, setPoliciesForm] = useState<PoliciesContent>(policiesContent);
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(storeSettings);

  const [newTestimonialForm, setNewTestimonialForm] = useState({ quote: '', author: '', city: 'Chennai', rating: 5 });
  const [newCouponForm, setNewCouponForm] = useState({ code: '', discountPercent: 10, description: '' });
  const [passwordChangeForm, setPasswordChangeForm] = useState({ currentPassword: '', newPassword: '' });

  /* Product details selection ephemeral state */
  const [activeSize, setActiveSize] = useState<string>('');
  const [activeColor, setActiveColor] = useState<string>('');
  const [activeQuantity, setActiveQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const categoryImageInputRef = useRef<HTMLInputElement>(null);

  /* Color image upload helper ref */
  const colorImageInputRef = useRef<HTMLInputElement>(null);
  const [activeEditingColorIndex, setActiveEditingColorIndex] = useState<number>(-1);

  /* Save Cart and Wishlist to LocalStorage */
  useEffect(() => {
    try {
      localStorage.setItem('dc_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('dc_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  /* Trigger fleeting Toast notification */
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3600);
  };

  /* Helper to fetch public data from backend */
  const fetchPublicData = async () => {
    try {
      const [prodRes, annRes, setRes, contentRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/announcements'),
        fetch('/api/settings'),
        fetch('/api/content')
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
        if (prodData.products?.length > 0 && !selectedProductId) {
          setSelectedProductId(prodData.products[0].id);
        }
      }

      if (annRes.ok) {
        const annData = await annRes.json();
        setAnnouncements(annData.announcements || []);
      }

      if (setRes.ok) {
        const setData = await setRes.json();
        setStoreSettings(setData.settings);
        setSettingsForm(setData.settings);
      }

      if (contentRes.ok) {
        const contentData = await contentRes.json();
        if (contentData.hero) { setHeroContent(contentData.hero); setHeroForm(contentData.hero); }
        if (contentData.categories) setCategoriesContent(contentData.categories);
        if (contentData.aboutStory) { setAboutContent(contentData.aboutStory); setAboutForm(contentData.aboutStory); }
        if (contentData.testimonials) setTestimonials(contentData.testimonials);
        if (contentData.policies) { setPoliciesContent(contentData.policies); setPoliciesForm(contentData.policies); }
        if (contentData.activeCoupons) setCoupons(contentData.activeCoupons);
      }
    } catch (err) {
      console.error('Error fetching data from API:', err);
    }
  };

  useEffect(() => {
    fetchPublicData();
  }, []);

  /* Check Admin Authentication */
  useEffect(() => {
    if (!adminToken) {
      setIsAdminAuthenticated(false);
      return;
    }
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setIsAdminAuthenticated(true);
        } else {
          setIsAdminAuthenticated(false);
          setAdminToken('');
          sessionStorage.removeItem('dc_admin_token');
        }
      })
      .catch(() => {
        setIsAdminAuthenticated(false);
      });
  }, [adminToken]);

  /* Load Admin Orders & Admin Coupons when authenticated */
  const loadAdminOrders = async () => {
    if (!adminToken) return;
    try {
      const [ordRes, cpnRes, testRes, catRes] = await Promise.all([
        fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${adminToken}` } }),
        fetch('/api/admin/coupons', { headers: { Authorization: `Bearer ${adminToken}` } }),
        fetch('/api/admin/testimonials', { headers: { Authorization: `Bearer ${adminToken}` } }),
        fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${adminToken}` } })
      ]);
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setAdminOrders(ordData.orders || []);
      }
      if (cpnRes.ok) {
        const cpnData = await cpnRes.json();
        setCoupons(cpnData.coupons || []);
      }
      if (testRes.ok) {
        const testData = await testRes.json();
        setTestimonials(testData.testimonials || []);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategoriesContent(catData.categories || []);
      }
    } catch (err) {
      console.error('Admin data load failed:', err);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated && adminToken) {
      loadAdminOrders();
    }
  }, [isAdminAuthenticated, adminToken]);

  /* View Navigation Handler */
  const navigateTo = (page: string, productId?: string) => {
    setCurrentPage(page);
    if (productId) setSelectedProductId(productId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  /* Selected product reference */
  const currentProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || products[0] || null;
  }, [products, selectedProductId]);

  /* Reset details selections on product switch */
  useEffect(() => {
    if (currentProduct) {
      setActiveSize(currentProduct.sizes[0] || 'Standard');
      setActiveColor(currentProduct.colors[0]?.name || 'Standard');
      setActiveQuantity(1);
      setActiveImageIndex(0);
    }
  }, [currentProduct]);

  /* When selecting a color, determine gallery photos (Color-specific photos if available) */
  const currentColorImages = useMemo(() => {
    if (!currentProduct) return [];
    const colorObj = currentProduct.colors.find(c => c.name === activeColor);
    if (colorObj && Array.isArray(colorObj.images) && colorObj.images.length > 0) {
      return colorObj.images;
    }
    return currentProduct.additionalImages && currentProduct.additionalImages.length > 0
      ? currentProduct.additionalImages
      : [currentProduct.image];
  }, [currentProduct, activeColor]);

  /* Calculate stock for selected color and size combination */
  const activeVariantStock = useMemo(() => {
    if (!currentProduct) return 0;
    if (currentProduct.variantStock) {
      const key = `${activeColor}_${activeSize}`;
      if (currentProduct.variantStock[key] !== undefined) {
        return currentProduct.variantStock[key];
      }
    }
    return currentProduct.stock;
  }, [currentProduct, activeColor, activeSize]);

  /* Filter New Arrivals for Homepage */
  const newArrivals = useMemo(() => {
    return products.filter(p => p.isNew && p.isPublished !== false);
  }, [products]);

  /* Filter Saved Wishlist Products */
  const wishlistProducts = useMemo(() => {
    return products.filter(p => wishlist.includes(p.id));
  }, [products, wishlist]);

  /* Cart Calculations */
  const cartDetailedItems = useMemo<DetailedCartItem[]>(() => {
    return cart
      .map(item => {
        const p = products.find(prod => prod.id === item.productId);
        if (!p) return null;
        return {
          ...item,
          product: p,
          totalItemPrice: p.price * item.quantity
        };
      })
      .filter((i): i is DetailedCartItem => i !== null);
  }, [cart, products]);

  const subtotal = useMemo(() => {
    return cartDetailedItems.reduce((acc, item) => acc + item.totalItemPrice, 0);
  }, [cartDetailedItems]);

  const discountAmount = useMemo(() => {
    return Math.round((subtotal * appliedDiscount) / 100);
  }, [subtotal, appliedDiscount]);

  /* Requirement 3: Location-based shipping: Tamil Nadu vs Pan-India */
  const isTamilNaduDelivery = useMemo(() => {
    const s = (checkoutData.state || '').trim().toLowerCase();
    return s.includes('tamil nadu') || s === 'tn';
  }, [checkoutData.state]);

  const shippingCharge = useMemo(() => {
    if (subtotal === 0) return 0;
    return isTamilNaduDelivery
      ? (storeSettings.shippingTamilNadu ?? 50)
      : (storeSettings.shippingPanIndia ?? 100);
  }, [subtotal, isTamilNaduDelivery, storeSettings]);

  /* Requirement 4: Editable GST Configuration */
  const gstRate = useMemo(() => {
    return typeof storeSettings.gstRate === 'number' ? storeSettings.gstRate : 12;
  }, [storeSettings.gstRate]);

  const isGstExclusive = useMemo(() => {
    return storeSettings.gstPricingMode === 'exclusive';
  }, [storeSettings.gstPricingMode]);

  const gstAmount = useMemo(() => {
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    if (isGstExclusive) {
      return Math.round((taxableAmount * gstRate) / 100);
    } else {
      // Inclusive pricing: tax is already embedded inside price
      return Math.round(taxableAmount - (taxableAmount / (1 + gstRate / 100)));
    }
  }, [subtotal, discountAmount, gstRate, isGstExclusive]);

  const grandTotal = useMemo(() => {
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    if (isGstExclusive) {
      return taxableAmount + gstAmount + shippingCharge;
    } else {
      return taxableAmount + shippingCharge;
    }
  }, [subtotal, discountAmount, gstAmount, shippingCharge, isGstExclusive]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const addToCart = (product: Product, size: string, color: string, qty: number = 1) => {
    // Check variant stock
    const variantKey = `${color}_${size}`;
    const available = product.variantStock?.[variantKey] ?? product.stock;
    if (available <= 0) {
      showToast(`Selected shade (${color}) and size (${size}) is currently out of stock.`);
      return;
    }

    setCart(prev => {
      const existingIdx = prev.findIndex(
        item => item.productId === product.id && item.selectedSize === size && item.selectedColor === color
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += qty;
        return copy;
      }
      return [
        ...prev,
        {
          productId: product.id,
          quantity: qty,
          selectedSize: size,
          selectedColor: color
        }
      ];
    });
    showToast(`Added "${product.name}" (${color} · ${size}) to your shopping bag.`);
  };

  const updateCartQuantity = (productId: string, size: string, color: string, change: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.productId === productId && item.selectedSize === size && item.selectedColor === color) {
            const newQty = item.quantity + change;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((i): i is CartItem => i !== null);
    });
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCart(prev =>
      prev.filter(
        item => !(item.productId === productId && item.selectedSize === size && item.selectedColor === color)
      )
    );
    showToast('Item removed from shopping bag.');
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        showToast('Removed from your saved wish list.');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Saved to your bridal & festive wish list.');
        return [...prev, productId];
      }
    });
  };

  /* DYNAMIC COUPON CODE CHECK */
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = couponCode.trim().toUpperCase();
    const found = coupons.find(c => c.isActive && c.code.trim().toUpperCase() === normalized);
    if (found) {
      setAppliedDiscount(found.discountPercent);
      showToast(`Privilege Code ${found.code} applied: ${found.discountPercent}% Off!`);
    } else if (normalized === 'DHASAMI10') {
      setAppliedDiscount(10);
      showToast('Festive Coupon DHASAMI10 applied: 10% Off!');
    } else if (normalized === 'ROYAL15') {
      setAppliedDiscount(15);
      showToast('VIP Privilege Code applied: 15% Off!');
    } else {
      showToast('Invalid or inactive coupon. Please check with our atelier.');
    }
  };

  /* Requirement 5: REAL SERVER-AUTHORITATIVE CHECKOUT & RAZORPAY INTEGRATION (NO COD) */
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Your bag is currently empty.');
      return;
    }

    setIsProcessingCheckout(true);

    try {
      const orderRes = await fetch('/api/checkout/create-payment-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customer: checkoutData,
          couponCode: appliedDiscount > 0 ? couponCode : undefined
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.message || orderData.error || 'Payment order initialization failed.');
      }

      if (orderData.gatewayReady && orderData.razorpayOrderId && window.Razorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountPaise,
          currency: orderData.currency || 'INR',
          name: storeSettings.brandDisplayName || 'Dhasami Couture',
          description: `Order ${orderData.orderId}`,
          image: heroContent.bgImage,
          order_id: orderData.razorpayOrderId,
          prefill: {
            name: checkoutData.fullName,
            email: checkoutData.email,
            contact: checkoutData.phone
          },
          theme: {
            color: '#4A0E17'
          },
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch('/api/checkout/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: orderData.orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                })
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.verified) {
                throw new Error(verifyData.error || 'Cryptographic payment verification failed.');
              }

              setConfirmedOrder({
                ...verifyData.order,
                paymentStatus: 'Verified Paid via Razorpay',
                customer: checkoutData
              });
              setCart([]);
              showToast('Payment verified successfully! Thank you for your patronage.');
              navigateTo('confirmation');
            } catch (verifyErr: any) {
              alert(`Payment verification notice: ${verifyErr.message}`);
            }
          },
          modal: {
            ondismiss: function () {
              showToast('Payment was cancelled or closed.');
              setIsProcessingCheckout(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Razorpay keys pending
        showToast(orderData.message || 'Razorpay Gateway keys pending configuration in Admin Dashboard.');
        setConfirmedOrder({
          orderId: orderData.orderId,
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          items: cartDetailedItems,
          subtotal,
          discountAmount,
          gstAmount,
          shippingCharge,
          grandTotal,
          customer: checkoutData,
          paymentMethod: 'razorpay',
          paymentStatus: 'Pending Gateway Settlement (Awaiting Key Setup in Admin)',
          fulfillmentStatus: 'Awaiting Payment'
        });
        setCart([]);
        navigateTo('confirmation');
      }
    } catch (err: any) {
      alert(err.message || 'Error processing checkout');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  /* ADMIN AUTHENTICATION ACTIONS */
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminLoginForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminLoginError(data.error || 'Authentication failed. Please verify owner credentials.');
        return;
      }
      setAdminToken(data.token);
      sessionStorage.setItem('dc_admin_token', data.token);
      setIsAdminAuthenticated(true);
      setIsOwnerLoginModalOpen(false);
      showToast('Welcome, Dhasami Atelier Owner. Full customizer unlocked.');
      fetchPublicData();
      loadAdminOrders();
      navigateTo('admin');
    } catch {
      setAdminLoginError('Server network error during login.');
    }
  };

  const handleAdminLogout = () => {
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    setAdminToken('');
    sessionStorage.removeItem('dc_admin_token');
    setIsAdminAuthenticated(false);
    showToast('Admin session logged out safely.');
  };

  /* ADMIN ACTIONS: TOGGLE NEW ARRIVAL */
  const handleToggleNewArrival = async (product: Product) => {
    try {
      const newStatus = !product.isNew;
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ isNew: newStatus })
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => (p.id === product.id ? { ...p, isNew: newStatus } : p)));
        showToast(`"${product.name}" ${newStatus ? 'marked as New Arrival' : 'removed from New Arrivals'}.`);
      }
    } catch {
      showToast('Failed to update product status.');
    }
  };

  /* ADMIN ACTIONS: TOGGLE PUBLISHED */
  const handleTogglePublished = async (product: Product) => {
    try {
      const newPublished = product.isPublished === false ? true : false;
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ isPublished: newPublished })
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => (p.id === product.id ? { ...p, isPublished: newPublished } : p)));
        showToast(`"${product.name}" is now ${newPublished ? 'Published' : 'Unpublished'}.`);
      }
    } catch {
      showToast('Failed to toggle publish status.');
    }
  };

  /* ADMIN ACTIONS: QUICK STOCK ADJUST */
  const handleAdminStockAdjust = async (productId: string, delta: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const newStock = Math.max(0, prod.stock + delta);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => (p.id === productId ? { ...p, stock: newStock } : p)));
        showToast(`Stock updated to ${newStock} units.`);
      }
    } catch {
      showToast('Failed to update stock.');
    }
  };

  /* ADMIN ACTIONS: DELETE PRODUCT */
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${productName}" from the catalogue?`)) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        showToast(`"${productName}" deleted from database.`);
      }
    } catch {
      showToast('Failed to delete product.');
    }
  };

  /* ADMIN ACTIONS: SAVE PRODUCT (CREATE OR EDIT) */
  const handleSaveProductModal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = Boolean(productForm.id);
      const endpoint = isEdit ? `/api/admin/products/${productForm.id}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      // Auto-compute total stock if variant stock exists
      let computedStock = Number(productForm.stock || 0);
      if (productForm.variantStock && Object.keys(productForm.variantStock).length > 0) {
        computedStock = Object.values(productForm.variantStock).reduce((acc, val) => acc + Number(val || 0), 0);
      }

      const payload = {
        ...productForm,
        stock: computedStock
      };

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to save product');

      if (isEdit) {
        setProducts(prev => prev.map(p => (p.id === data.product.id ? data.product : p)));
        showToast(`Updated "${data.product.name}" successfully.`);
      } else {
        setProducts(prev => [data.product, ...prev]);
        showToast(`Added new ensemble "${data.product.name}".`);
      }

      setIsEditingProductModal(false);
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    }
  };

  /* ADMIN ACTIONS: CATEGORY MANAGEMENT (Requirement 8) */
  const handleSaveCategoryModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.key || !categoryForm.title) {
      alert('Category key and title are required.');
      return;
    }

    try {
      const existing = categoriesContent.find(c => c.key === categoryForm.key);
      const isEdit = Boolean(existing);
      const endpoint = isEdit ? `/api/admin/categories/${categoryForm.key}` : '/api/admin/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(categoryForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to save category');

      setCategoriesContent(data.categories);
      showToast(`Category "${categoryForm.title}" saved successfully.`);
      setIsEditingCategoryModal(false);
    } catch (err: any) {
      alert(err.message || 'Error saving category');
    }
  };

  const handleDeleteCategory = async (key: string, title: string) => {
    const productsInCat = products.filter(p => p.category === key);
    let reassignToKey = '';

    if (productsInCat.length > 0) {
      const remainingCats = categoriesContent.filter(c => c.key !== key);
      if (remainingCats.length === 0) {
        alert('Cannot delete the only category while products exist.');
        return;
      }
      const target = prompt(
        `There are ${productsInCat.length} products currently in "${title}". Enter the identifier of the category to reassign them to (${remainingCats.map(c => c.key).join(', ')}):`,
        remainingCats[0].key
      );
      if (!target) return;
      reassignToKey = target;
    } else {
      if (!confirm(`Are you sure you want to delete category "${title}"?`)) return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${key}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ reassignToKey })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete category');

      setCategoriesContent(data.categories);
      fetchPublicData();
      showToast(`Category "${title}" removed.`);
    } catch (err: any) {
      alert(err.message || 'Error deleting category');
    }
  };

  /* ADMIN ACTIONS: IMAGE UPLOADS */
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetField: 'product' | 'hero' | 'category' | 'color' = 'product') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          body: JSON.stringify({ base64Data, filename: file.name })
        });
        const data = await res.json();
        const uploadedUrl = data.url || base64Data;

        if (targetField === 'product') {
          setProductForm(prev => ({
            ...prev,
            image: uploadedUrl,
            additionalImages: prev.additionalImages ? [...prev.additionalImages, uploadedUrl] : [uploadedUrl]
          }));
          showToast('Product photo uploaded successfully.');
        } else if (targetField === 'hero') {
          setHeroForm(prev => ({ ...prev, bgImage: uploadedUrl }));
          showToast('Hero background image uploaded.');
        } else if (targetField === 'category') {
          setCategoryForm(prev => ({ ...prev, img: uploadedUrl }));
          showToast('Category image uploaded.');
        } else if (targetField === 'color' && activeEditingColorIndex >= 0) {
          setProductForm(prev => {
            const colors = [...(prev.colors || [])];
            const activeC = colors[activeEditingColorIndex];
            if (activeC) {
              const currentImgs = activeC.images || [];
              colors[activeEditingColorIndex] = {
                ...activeC,
                images: [...currentImgs, uploadedUrl]
              };
            }
            return { ...prev, colors };
          });
          showToast('Shade photograph uploaded.');
        }
      } catch {
        showToast('Image processing completed.');
      }
    };
    reader.readAsDataURL(file);
  };

  /* ADMIN ACTIONS: SAVE HERO CONTENT */
  const handleSaveHeroContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/content/hero', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(heroForm)
      });
      const data = await res.json();
      if (res.ok) {
        setHeroContent(data.hero);
        showToast('Hero section content updated and saved.');
      }
    } catch {
      showToast('Failed to save hero content.');
    }
  };

  /* ADMIN ACTIONS: SAVE ABOUT CONTENT */
  const handleSaveAboutContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/content/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(aboutForm)
      });
      const data = await res.json();
      if (res.ok) {
        setAboutContent(data.about);
        showToast('About & Heritage content updated and saved.');
      }
    } catch {
      showToast('Failed to save about content.');
    }
  };

  /* ADMIN ACTIONS: SAVE POLICIES CONTENT */
  const handleSavePoliciesContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/content/policies', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(policiesForm)
      });
      const data = await res.json();
      if (res.ok) {
        setPoliciesContent(data.policies);
        showToast('Store policies updated and saved.');
      }
    } catch {
      showToast('Failed to save policies.');
    }
  };

  /* ADMIN ACTIONS: SAVE SETTINGS (SHIPPING, GST, SOCIAL, INFO) */
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(settingsForm)
      });
      const data = await res.json();
      if (res.ok) {
        setStoreSettings(data.settings);
        showToast('Store, Shipping & GST configurations saved to database.');
      }
    } catch {
      showToast('Failed to save settings.');
    }
  };

  /* ADMIN ACTIONS: ADD / DELETE TESTIMONIAL */
  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonialForm.quote || !newTestimonialForm.author) return;
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(newTestimonialForm)
      });
      const data = await res.json();
      if (res.ok) {
        setTestimonials(prev => [...prev, data.testimonial]);
        setNewTestimonialForm({ quote: '', author: '', city: 'Chennai', rating: 5 });
        showToast('Patron testimonial added to homepage.');
      }
    } catch {
      showToast('Failed to add testimonial.');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setTestimonials(prev => prev.filter(t => t.id !== id));
        showToast('Testimonial removed.');
      }
    } catch {
      showToast('Failed to delete testimonial.');
    }
  };

  /* ADMIN ACTIONS: ADD / DELETE COUPON */
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponForm.code || !newCouponForm.discountPercent) return;
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(newCouponForm)
      });
      const data = await res.json();
      if (res.ok) {
        setCoupons(prev => [...prev, data.coupon]);
        setNewCouponForm({ code: '', discountPercent: 10, description: '' });
        showToast(`Promo Code ${data.coupon.code} created and activated!`);
      }
    } catch {
      showToast('Failed to create coupon.');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setCoupons(prev => prev.filter(c => c.id !== id));
        showToast('Promo code removed.');
      }
    } catch {
      showToast('Failed to delete coupon.');
    }
  };

  /* ADMIN ACTIONS: ANNOUNCEMENTS */
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementText.trim()) return;
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ text: newAnnouncementText })
      });
      const data = await res.json();
      if (res.ok) {
        setAnnouncements(prev => [...prev, data.announcement]);
        setNewAnnouncementText('');
        showToast('Announcement added to marquee.');
      }
    } catch {
      showToast('Failed to add announcement.');
    }
  };

  const handleToggleAnnouncement = async (ann: Announcement) => {
    try {
      const res = await fetch(`/api/admin/announcements/${ann.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ isActive: !ann.isActive })
      });
      if (res.ok) {
        setAnnouncements(prev => prev.map(a => (a.id === ann.id ? { ...a, isActive: !ann.isActive } : a)));
        showToast(`Announcement ${!ann.isActive ? 'activated' : 'hidden'}.`);
      }
    } catch {
      showToast('Failed to toggle announcement.');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
        showToast('Announcement removed.');
      }
    } catch {
      showToast('Failed to delete announcement.');
    }
  };

  /* ADMIN ACTIONS: PASSWORD UPDATE */
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(passwordChangeForm)
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Owner password updated securely in database.');
        setPasswordChangeForm({ currentPassword: '', newPassword: '' });
      } else {
        alert(data.error || 'Failed to update password');
      }
    } catch {
      alert('Error updating password');
    }
  };

  /* FILTERED PRODUCTS FOR SHOP PAGE */
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        if (p.isPublished === false) return false;
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (priceMax && p.price > priceMax) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCraft = p.craft.toLowerCase().includes(q);
          const matchFabric = p.fabric.toLowerCase().includes(q);
          const matchColor = p.colors.some(c => c.name.toLowerCase().includes(q));
          if (!matchName && !matchCraft && !matchFabric && !matchColor) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, priceMax, sortBy]);

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const getWhatsAppUrl = (customText?: string) => {
    const phone = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
    const text = customText || 'Namaste Dhasami Couture, I would like to inquire regarding bridal consultation and bespoke sizing.';
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 flex flex-col font-sans selection:bg-[#4A0E17] selection:text-amber-100">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-[#1A0307] text-[#F3E9DD] px-5 py-3 rounded-lg shadow-2xl border border-[#C59B27]/40 text-xs sm:text-sm font-medium flex items-center gap-3 transition-transform animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* OWNER LIVE QUICK-EDIT BANNER (WHEN LOGGED IN) */}
      {isAdminAuthenticated && (
        <div className="bg-[#3D0A13] text-amber-200 text-xs py-1.5 px-4 border-b border-amber-600/40 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-amber-100">Owner Live Editing Mode Active</span>
            <span className="text-amber-300/80 hidden sm:inline">· You can customize all categories, dresses, location shipping rates & GST</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setAdminTab('categories'); navigateTo('admin'); }}
              className="text-[11px] underline hover:text-white"
            >
              Categories
            </button>
            <button
              onClick={() => { setAdminTab('products'); navigateTo('admin'); }}
              className="text-[11px] underline hover:text-white"
            >
              Dresses
            </button>
            <button
              onClick={() => { setAdminTab('shipping-tax'); navigateTo('admin'); }}
              className="text-[11px] underline hover:text-white"
            >
              Shipping & GST
            </button>
            <button
              onClick={() => navigateTo('admin')}
              className="bg-amber-400 text-stone-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider"
            >
              Open Full Studio
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
         1. COMPANY NAME / LOGO AND MAIN NAVIGATION HEADER (AT THE VERY TOP)
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#24050B] text-[#EEDFCB] border-b border-[#3D141C] shadow-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-6">
            
            {/* Mobile Menu Toggle */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-[#EEDFCB] hover:text-white focus:outline-none"
                aria-label="Toggle Navigation"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* PROMINENT BRAND NAME: Stylish, elegant italic serif in pale sand/beige */}
            <div
              className="text-center sm:text-left cursor-pointer select-none shrink-0 py-1"
              onClick={() => navigateTo('home')}
            >
              <span className="font-serif italic font-normal tracking-wide text-2xl sm:text-3xl lg:text-4xl text-[#EEDFCB] hover:text-[#FAF3EB] drop-shadow-sm transition-colors whitespace-nowrap block">
                {storeSettings.brandDisplayName || 'Dhasami Couture'}
              </span>
              <span className="text-[9px] tracking-[0.45em] uppercase text-[#D2BBA2] font-sans font-light block -mt-1 sm:-mt-0.5 opacity-90">
                {storeSettings.brandSubtitle || 'HAUTE COUTURE · CHENNAI'}
              </span>
            </div>

            {/* Requirement 8: Desktop Navigation Links DYNAMICALLY DRIVEN FROM CATEGORIES */}
            <nav className="hidden lg:flex items-center space-x-6 text-xs tracking-widest uppercase font-medium text-[#D8C7B4]">
              <button
                onClick={() => navigateTo('home')}
                className={`hover:text-white transition-colors pb-1 border-b-2 whitespace-nowrap shrink-0 ${
                  currentPage === 'home' ? 'border-[#EEDFCB] text-white font-semibold' : 'border-transparent'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => { setSelectedCategory('all'); navigateTo('shop'); }}
                className={`hover:text-white transition-colors pb-1 border-b-2 whitespace-nowrap shrink-0 ${
                  currentPage === 'shop' && selectedCategory === 'all'
                    ? 'border-[#EEDFCB] text-white font-semibold'
                    : 'border-transparent'
                }`}
              >
                Shop All
              </button>

              {/* Dynamic Owner-Configured Categories (NO Pure Silk Sarees) */}
              {categoriesContent.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => { setSelectedCategory(cat.key); navigateTo('shop'); }}
                  className={`hover:text-white transition-colors pb-1 border-b-2 whitespace-nowrap shrink-0 ${
                    currentPage === 'shop' && selectedCategory === cat.key
                      ? 'border-[#EEDFCB] text-white font-semibold'
                      : 'border-transparent'
                  }`}
                >
                  {cat.title}
                </button>
              ))}

              <button
                onClick={() => navigateTo('about')}
                className={`hover:text-white transition-colors pb-1 border-b-2 whitespace-nowrap shrink-0 ${
                  currentPage === 'about' ? 'border-[#EEDFCB] text-white font-semibold' : 'border-transparent'
                }`}
              >
                Our Heritage
              </button>
            </nav>

            {/* Right Action Affordances */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              <a
                href={storeSettings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-[#EEDFCB]/90 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden sm:inline-flex"
                title={`Follow @${storeSettings.instagramHandle} on Instagram`}
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-[#EEDFCB]/90 hover:text-emerald-300 hover:bg-white/10 rounded-full transition-colors hidden sm:inline-flex"
                title="Connect on WhatsApp"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              <button
                onClick={() => navigateTo('shop')}
                className="p-2 text-[#EEDFCB]/90 hover:text-white transition-colors"
                title="Search Catalogue"
                aria-label="Search Collection"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={() => navigateTo('wishlist')}
                className={`p-2 transition-colors relative rounded-full ${
                  currentPage === 'wishlist' ? 'text-amber-300 bg-white/10' : 'text-[#EEDFCB]/90 hover:text-white'
                }`}
                title={`Saved Wishlist (${wishlist.length})`}
                aria-label="Wishlist"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-stone-950 text-[10px] rounded-full flex items-center justify-center font-bold tabular-nums">
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigateTo('cart')}
                className={`p-2 transition-colors relative rounded-full flex items-center gap-1.5 ${
                  currentPage === 'cart' ? 'text-amber-300 bg-white/10' : 'text-[#EEDFCB]/90 hover:text-white'
                }`}
                title={`Shopping Bag (${totalCartCount})`}
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {totalCartCount > 0 && (
                  <span className="w-4 h-4 bg-[#C59B27] text-stone-950 text-[10px] rounded-full flex items-center justify-center font-bold tabular-nums">
                    {totalCartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigateTo('admin')}
                className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded border transition-colors whitespace-nowrap ${
                  isAdminAuthenticated
                    ? 'border-amber-400 text-amber-300 bg-amber-950/60 font-semibold shadow-sm'
                    : 'border-amber-700/60 text-[#EEDFCB] bg-[#340710] hover:bg-[#460915] hover:border-amber-400 font-semibold'
                }`}
                title="Atelier Owner Portal & Controls"
              >
                <Lock className="w-3 h-3 text-amber-300" />
                <span>{isAdminAuthenticated ? 'Owner Studio ✦' : 'Owner Mode'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#1E0409] border-t border-[#3B0E17] px-4 pt-3 pb-6 space-y-3 text-sm font-medium uppercase tracking-wider text-[#EEDFCB]">
            <button onClick={() => navigateTo('home')} className="block w-full text-left py-2 hover:text-white">Home</button>
            <button onClick={() => { setSelectedCategory('all'); navigateTo('shop'); }} className="block w-full text-left py-2 hover:text-white">Shop All Curations</button>
            {categoriesContent.map(cat => (
              <button
                key={cat.key}
                onClick={() => { setSelectedCategory(cat.key); navigateTo('shop'); }}
                className="block w-full text-left py-2 hover:text-white"
              >
                {cat.title}
              </button>
            ))}

            {/* Direct Mobile Links for Cart & Wishlist */}
            <div className="pt-3 border-t border-[#3B0E17] grid grid-cols-2 gap-2 text-xs normal-case">
              <button
                onClick={() => navigateTo('cart')}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-[#2D0A11] rounded-lg border border-amber-900/60 text-amber-200 font-semibold"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Shopping Bag ({totalCartCount})</span>
              </button>
              <button
                onClick={() => navigateTo('wishlist')}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-[#2D0A11] rounded-lg border border-amber-900/60 text-amber-200 font-semibold"
              >
                <Heart className="w-4 h-4 text-amber-400 fill-current" />
                <span>Wishlist ({wishlist.length})</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigateTo('admin')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-[#4A0E17] to-[#2B080F] rounded-lg border border-amber-600/70 text-amber-200 text-xs font-bold uppercase tracking-wider shadow"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAdminAuthenticated ? '👑 Open Owner Studio' : '👑 Owner Mode & Customizer'}</span>
              </button>
            </div>
            
            <div className="pt-3 border-t border-[#3B0E17] flex items-center justify-between text-xs normal-case text-[#D2BBA2]">
              <a href={getWhatsAppUrl()} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white">
                <MessageCircle className="w-4 h-4 text-emerald-400" /> WhatsApp Stylist
              </a>
              <a href={storeSettings.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white">
                <Instagram className="w-4 h-4 text-rose-300" /> @{storeSettings.instagramHandle}
              </a>
            </div>

            <div className="pt-2 border-t border-[#3B0E17] flex flex-col space-y-2 text-xs normal-case text-[#D2BBA2]">
              <button onClick={() => navigateTo('about')} className="text-left py-1 hover:text-white">About the Ateliers</button>
              <button onClick={() => navigateTo('contact')} className="text-left py-1 hover:text-white">Boutique Appointment & Contact</button>
              <button onClick={() => navigateTo('policies')} className="text-left py-1 hover:text-white">Shipping, Exchange & Privacy</button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
         Requirement 6: SCROLLING ANNOUNCEMENT BAR DIRECTLY BELOW HEADER
         ========================================================================= */}
      <div className="bg-[#1A0307] text-[#EADCC9] text-xs h-9 overflow-hidden border-b border-[#3B0E17] relative z-30 flex items-center select-none group shadow-inner">
        <div className="animate-marquee-scroll whitespace-nowrap flex items-center gap-8 px-4 font-serif text-[11px] sm:text-xs tracking-wider">
          {announcements.filter(a => a.isActive).length > 0 ? (
            <>
              {announcements.filter(a => a.isActive).map(ann => (
                <span key={ann.id} className="inline-flex items-center gap-3">
                  <span>{ann.text}</span>
                  <span className="text-[#C59B27]" aria-hidden="true">✦</span>
                </span>
              ))}
              {announcements.filter(a => a.isActive).map(ann => (
                <span key={`dup-${ann.id}`} className="inline-flex items-center gap-3">
                  <span>{ann.text}</span>
                  <span className="text-[#C59B27]" aria-hidden="true">✦</span>
                </span>
              ))}
            </>
          ) : (
            <span className="inline-flex items-center gap-3">
              <span>✨ FESTIVE ATELIER COLLECTION LIVE · TAMIL NADU DELIVERY ₹50 · PAN-INDIA EXPRESS ₹100</span>
              <span className="text-[#C59B27]">✦</span>
            </span>
          )}
        </div>
        {isAdminAuthenticated && (
          <button
            onClick={() => { setAdminTab('announcements'); navigateTo('admin'); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-40 bg-[#C59B27] hover:bg-amber-400 text-stone-950 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow transition-colors"
            title="Edit scrolling announcements"
          >
            <Edit className="w-3 h-3" /> Edit Marquee
          </button>
        )}
      </div>

      {/* =========================================================================
         MAIN APPLICATION CONTENT
         ========================================================================= */}
      <main className="flex-1">
        
        {/* VIEW 1: HOME PAGE */}
        {currentPage === 'home' && (
          <div>
            {/* Hero Campaign Banner (Dynamic & Owner-Customizable) */}
            <section className="relative min-h-[560px] lg:min-h-[640px] flex items-center bg-[#20040A] text-amber-50 overflow-hidden">
              <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
                <img
                  src={heroContent.bgImage}
                  alt="Dhasami Couture Background"
                  className="w-full h-full object-cover object-top filter brightness-90"
                  referrerPolicy="no-referrer"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#1A0307] via-[#2A060F]/85 to-transparent z-10" />

              <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
                <div className="max-w-2xl relative">
                  {isAdminAuthenticated && (
                    <button
                      onClick={() => { setAdminTab('hero'); navigateTo('admin'); }}
                      className="absolute -top-10 left-0 bg-amber-400 text-stone-950 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md hover:bg-amber-300"
                    >
                      <Edit className="w-3 h-3" /> Edit Hero Section
                    </button>
                  )}

                  <span className="text-[#EEDFCB] text-xs sm:text-sm tracking-[0.3em] uppercase font-serif mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    {heroContent.kicker}
                  </span>
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.15] text-[#FAF3EB]">
                    {heroContent.headline} <br />
                    <span className="italic font-light text-[#EEDFCB]">{heroContent.headlineItalic}</span>
                  </h1>
                  <p className="mt-5 text-sm sm:text-base text-stone-300 leading-relaxed font-light">
                    {heroContent.description}
                  </p>
                  
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => { setSelectedCategory(heroContent.cta1Category || 'all'); navigateTo('shop'); }}
                      className="px-8 py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-semibold text-xs tracking-widest uppercase rounded shadow-lg transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                    >
                      <span>{heroContent.cta1Text}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setSelectedCategory(heroContent.cta2Category || 'kurtis'); navigateTo('shop'); }}
                      className="px-6 py-3.5 border border-[#EEDFCB]/40 hover:border-[#EEDFCB] text-[#EEDFCB] text-xs tracking-widest uppercase rounded transition-colors"
                    >
                      {heroContent.cta2Text}
                    </button>
                  </div>

                  {/* Trust Counters */}
                  <div className="mt-12 pt-8 border-t border-amber-900/40 grid grid-cols-3 gap-6 text-center sm:text-left">
                    {heroContent.stats?.map((stat, i) => (
                      <div key={i}>
                        <p className="font-serif text-xl sm:text-2xl text-[#EEDFCB] font-bold tabular-nums">{stat.value}</p>
                        <p className="text-[11px] text-stone-400 uppercase tracking-wider">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Requirement 3: NEW ARRIVALS SECTION */}
            <section className="py-16 bg-[#FDFBF7] border-b border-stone-200/70">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10">
                  <div>
                    <span className="text-[11px] tracking-[0.25em] uppercase text-[#4A0E17] font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
                      ATELIER PREVIEWS
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 mt-1">
                      New Arrivals · Festive Atelier Curations
                    </h2>
                    <p className="text-xs text-stone-500 mt-1 max-w-xl">
                      Newly added limited-edition weaves and contemporary festive silhouettes.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-3 md:mt-0">
                    {isAdminAuthenticated && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setProductForm({
                              name: '',
                              category: categoriesContent[0]?.key || 'kurtis',
                              categoryLabel: categoriesContent[0]?.title || 'Festive Kurti Sets',
                              price: 4999,
                              originalPrice: 6500,
                              rating: 5.0,
                              reviewsCount: 1,
                              isBestseller: false,
                              isNew: true,
                              isPublished: true,
                              stock: 5,
                              colors: [{ name: 'Heritage Crimson', hex: '#8B1E3F', images: [] }],
                              sizes: ['XS', 'S', 'M', 'L', 'XL'],
                              variantStock: {},
                              fabric: 'Pure Chanderi Silk Blend',
                              craft: 'Handcrafted Needlework',
                              leadTime: 'Ready to dispatch within 24 hours',
                              description: 'Artisanal festive silhouette.',
                              image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
                              additionalImages: []
                            });
                            setIsEditingProductModal(true);
                          }}
                          className="text-xs font-bold text-amber-950 bg-[#C59B27] hover:bg-[#D4AF37] px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add New Dress
                        </button>
                        <button
                          onClick={() => { setAdminTab('products'); navigateTo('admin'); }}
                          className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-amber-200 transition-colors"
                        >
                          <Edit className="w-3 h-3" /> Manage Catalogue
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => { setSelectedCategory('all'); navigateTo('shop'); }}
                      className="text-xs font-semibold uppercase tracking-wider text-[#4A0E17] hover:text-stone-900 flex items-center gap-1.5"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {newArrivals.slice(0, 4).map(prod => (
                    <div
                      key={prod.id}
                      className="bg-white rounded-xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-lg transition-all group flex flex-col"
                    >
                      <div
                        className="relative aspect-[3/4] overflow-hidden bg-stone-100 cursor-pointer"
                        onClick={() => navigateTo('product', prod.id)}
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                        {isAdminAuthenticated ? (
                          <div className="absolute top-3 left-3 z-20 flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setProductForm(prod);
                                setIsEditingProductModal(true);
                              }}
                              className="bg-[#C59B27] hover:bg-[#D4AF37] text-stone-950 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded shadow flex items-center gap-1"
                              title="Edit this dress"
                            >
                              <Edit className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleNewArrival(prod);
                              }}
                              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded shadow ${
                                prod.isNew ? 'bg-[#4A0E17] text-amber-200' : 'bg-stone-800 text-stone-200'
                              }`}
                              title="Toggle New Arrival"
                            >
                              {prod.isNew ? '★ New' : '+ Set New'}
                            </button>
                          </div>
                        ) : (
                          <span className="absolute top-3 left-3 bg-[#4A0E17] text-[#FAF3EB] text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded shadow-md">
                            New Arrival
                          </span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                          aria-label={`Save ${prod.name} to wishlist`}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
                            wishlist.includes(prod.id)
                              ? 'bg-[#4A0E17] text-amber-200'
                              : 'bg-white/80 text-stone-700 hover:bg-white'
                          }`}
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>

                      <div className="p-4 flex flex-col flex-1 justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-amber-900 font-medium">
                            <span>{prod.categoryLabel}</span>
                            <span className="flex items-center gap-1 text-amber-600 font-semibold tabular-nums">
                              <Star className="w-3 h-3 fill-current" /> {prod.rating}
                            </span>
                          </div>
                          <h3 
                            onClick={() => navigateTo('product', prod.id)}
                            className="font-serif text-sm font-semibold text-stone-900 mt-1 hover:text-[#4A0E17] cursor-pointer line-clamp-1"
                          >
                            {prod.name}
                          </h3>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-1">{prod.craft}</p>
                          
                          <div className="flex items-center gap-1 mt-2 text-[10px] text-stone-600">
                            <span className="font-semibold text-stone-400">Sizes:</span>
                            <span className="truncate">{prod.sizes.join(' · ')}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                          <div>
                            <span className="text-sm font-bold text-stone-950 tabular-nums">{formatINR(prod.price)}</span>
                            {prod.originalPrice > prod.price && (
                              <span className="text-xs text-stone-400 line-through ml-2 tabular-nums">{formatINR(prod.originalPrice)}</span>
                            )}
                          </div>
                          <button
                            onClick={() => addToCart(prod, prod.sizes[0], prod.colors[0]?.name || 'Standard')}
                            className="px-3 py-1.5 bg-[#4A0E17] hover:bg-[#2E070F] text-[#FAF3EB] text-xs font-semibold rounded transition-colors flex items-center gap-1"
                            title="Add to Shopping Bag"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Requirement 8: DYNAMIC CATEGORIES GRID (NO PURE SILK SAREES) */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              {isAdminAuthenticated && (
                <button
                  onClick={() => { setAdminTab('categories'); navigateTo('admin'); }}
                  className="absolute top-4 right-4 bg-amber-400 text-stone-950 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow hover:bg-amber-300"
                >
                  <Edit className="w-3 h-3" /> Manage Categories
                </button>
              )}

              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-[11px] tracking-[0.25em] uppercase text-amber-800 font-semibold">Couture Collections</span>
                <h2 className="font-serif text-3xl font-medium text-stone-900 mt-1">Curated For Every Celebration</h2>
                <div className="w-16 h-0.5 bg-amber-700 mx-auto mt-3"></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {categoriesContent.map((cat) => (
                  <div
                    key={cat.key}
                    onClick={() => { setSelectedCategory(cat.key); navigateTo('shop'); }}
                    className="group relative h-80 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all"
                  >
                    <img
                      src={cat.img}
                      alt={cat.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-90 group-hover:brightness-95"
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent flex flex-col justify-end p-5 text-amber-50">
                      <p className="text-xs text-amber-300 font-sans tracking-widest uppercase">{cat.subtitle}</p>
                      <h3 className="font-serif text-lg sm:text-xl font-medium">{cat.title}</h3>
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <p className="text-[10px] text-stone-300 line-clamp-1 mt-0.5">
                          {cat.subcategories.slice(0, 2).join(' · ')}
                        </p>
                      )}
                      <span className="text-[11px] text-stone-300 underline underline-offset-4 mt-2 flex items-center gap-1 group-hover:text-amber-200">
                        View Curations <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Heritage Craftsmanship Story Section */}
            <section className="py-20 bg-[#FAF7F2] relative">
              {isAdminAuthenticated && (
                <button
                  onClick={() => { setAdminTab('about'); navigateTo('admin'); }}
                  className="absolute top-6 right-8 bg-amber-400 text-stone-950 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow hover:bg-amber-300 z-10"
                >
                  <Edit className="w-3 h-3" /> Edit Heritage Story
                </button>
              )}

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="relative">
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                      <img
                        src={aboutContent.guildImg}
                        alt="Weaving loom at Dhasami Couture"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    </div>
                    <div className="absolute -bottom-6 -right-4 sm:-bottom-8 sm:-right-8 bg-[#4A0E17] text-amber-100 p-6 rounded-2xl shadow-xl max-w-xs border border-amber-600/30 hidden sm:block">
                      <Award className="w-8 h-8 text-amber-400 mb-2" />
                      <p className="font-serif text-base font-semibold">{aboutContent.guildTitle}</p>
                      <p className="text-xs text-stone-300 mt-1">{aboutContent.guildDesc}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <span className="text-xs tracking-[0.25em] uppercase text-[#4A0E17] font-semibold">{aboutContent.kicker}</span>
                    <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal leading-tight">
                      {aboutContent.headline}
                    </h2>
                    {aboutContent.storyParagraphs?.map((para, i) => (
                      <p key={i} className="text-sm text-stone-600 leading-relaxed">{para}</p>
                    ))}

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      {aboutContent.promises?.slice(0, 2).map((pr, i) => (
                        <div key={i} className="p-4 bg-white rounded-xl border border-stone-200">
                          <ShieldCheck className="w-5 h-5 text-amber-700 mb-1" />
                          <h3 className="font-serif text-sm font-bold text-stone-900">{pr.title}</h3>
                          <p className="text-[11px] text-stone-500 mt-1">{pr.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center gap-6">
                      <button
                        onClick={() => navigateTo('about')}
                        className="text-xs uppercase tracking-widest font-semibold text-[#4A0E17] underline underline-offset-8 hover:text-amber-700 transition-colors"
                      >
                        Read Our Full Artisan Chronicle →
                      </button>
                      <a
                        href={getWhatsAppUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 hover:underline"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        Consult Boutique Stylist
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Customer Testimonials */}
            <section className="py-16 bg-white border-t border-stone-200 relative">
              {isAdminAuthenticated && (
                <button
                  onClick={() => { setAdminTab('testimonials'); navigateTo('admin'); }}
                  className="absolute top-6 right-8 bg-amber-400 text-stone-950 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow hover:bg-amber-300"
                >
                  <Edit className="w-3 h-3" /> Edit Reviews
                </button>
              )}

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                  <span className="text-[11px] tracking-[0.25em] uppercase text-[#4A0E17] font-semibold">Boutique Reviews</span>
                  <h2 className="font-serif text-2xl font-medium text-stone-900 mt-1">Words From Our Patrons</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {testimonials.map((rev) => (
                    <div key={rev.id} className="p-6 bg-stone-50 rounded-xl border border-stone-200/70 flex flex-col justify-between">
                      <div>
                        <div className="flex text-amber-500 mb-3">
                          {[...Array(rev.rating || 5)].map((_, s) => (
                            <Star key={s} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">"{rev.quote}"</p>
                      </div>
                      <div className="mt-5 pt-4 border-t border-stone-200/60">
                        <p className="font-serif text-xs font-bold text-stone-900">{rev.author}</p>
                        <p className="text-[10px] text-stone-500">{rev.city}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: SHOP ALL & CATALOGUE PAGE */}
        {currentPage === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Breadcrumb */}
            <div className="mb-8">
              <nav className="text-xs text-stone-500 mb-2 flex items-center gap-1.5">
                <span className="cursor-pointer hover:underline" onClick={() => navigateTo('home')}>Home</span>
                <span>/</span>
                <span className="text-stone-900 font-semibold">Couture Collection</span>
                {selectedCategory !== 'all' && (
                  <>
                    <span>/</span>
                    <span className="capitalize text-[#4A0E17] font-semibold">
                      {categoriesContent.find(c => c.key === selectedCategory)?.title || selectedCategory}
                    </span>
                  </>
                )}
              </nav>
              <h1 className="font-serif text-3xl sm:text-4xl text-stone-900">
                {selectedCategory === 'all'
                  ? 'The Complete Atelier Catalogue'
                  : categoriesContent.find(c => c.key === selectedCategory)?.title || 'Curated Ensembles'}
              </h1>
              <p className="text-xs text-stone-500 mt-1">Showing {filteredProducts.length} certified designer pieces</p>
            </div>

            {/* Filter Bar & Controls (Dynamic Categories) */}
            <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-sm mb-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              
              <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#4A0E17] text-amber-200 shadow'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  All Items
                </button>
                {categoriesContent.map(c => (
                  <button
                    key={c.key}
                    onClick={() => setSelectedCategory(c.key)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === c.key
                        ? 'bg-[#4A0E17] text-amber-200 shadow'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {c.title}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search silk, zari, shade, craft..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-7 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A0E17]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 whitespace-nowrap">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none text-stone-800"
                  >
                    <option value="featured">Featured Curations</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-stone-200 p-8">
                <Layers className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-lg text-stone-800 font-medium">No Ateliers match your criteria</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">Try clearing search filters or selecting "All Items" to browse our complete collection.</p>
                <button
                  onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                  className="mt-4 px-4 py-2 bg-stone-900 text-stone-50 text-xs rounded-lg uppercase tracking-wider font-semibold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(prod => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-lg transition-all group flex flex-col"
                  >
                    <div 
                      className="relative aspect-[3/4] bg-stone-100 overflow-hidden cursor-pointer"
                      onClick={() => navigateTo('product', prod.id)}
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                      {isAdminAuthenticated ? (
                        <div className="absolute top-3 left-3 z-20 flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductForm(prod);
                              setIsEditingProductModal(true);
                            }}
                            className="bg-[#C59B27] hover:bg-[#D4AF37] text-stone-950 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded shadow flex items-center gap-1"
                            title="Edit this dress"
                          >
                            <Edit className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleNewArrival(prod);
                            }}
                            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded shadow ${
                              prod.isNew ? 'bg-[#4A0E17] text-amber-200' : 'bg-stone-800 text-stone-200'
                            }`}
                            title="Toggle New Arrival"
                          >
                            {prod.isNew ? '★ New' : '+ Set New'}
                          </button>
                        </div>
                      ) : (
                        prod.isNew && (
                          <span className="absolute top-3 left-3 bg-[#4A0E17] text-amber-200 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow">
                            New Arrival
                          </span>
                        )
                      )}
                      {prod.stock <= 3 && prod.stock > 0 && (
                        <span className="absolute bottom-3 left-3 bg-amber-500 text-stone-950 font-bold text-[10px] px-2 py-0.5 rounded shadow">
                          Only {prod.stock} Left
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                        aria-label={`Save ${prod.name} to wishlist`}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
                          wishlist.includes(prod.id)
                            ? 'bg-[#4A0E17] text-amber-200'
                            : 'bg-white/80 text-stone-700 hover:bg-white'
                        }`}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-amber-900 font-medium">
                          <span>{prod.categoryLabel}</span>
                          <span className="flex items-center gap-1 text-amber-600 font-semibold tabular-nums">
                            <Star className="w-3 h-3 fill-current" /> {prod.rating} ({prod.reviewsCount})
                          </span>
                        </div>
                        <h3 
                          onClick={() => navigateTo('product', prod.id)}
                          className="font-serif text-sm font-semibold text-stone-900 mt-1 hover:text-[#4A0E17] cursor-pointer line-clamp-1"
                        >
                          {prod.name}
                        </h3>
                        <p className="text-xs text-stone-500 mt-1 line-clamp-1">{prod.fabric}</p>

                        <div className="flex items-center gap-1.5 mt-2.5">
                          {prod.colors.map(col => (
                            <span
                              key={col.name}
                              className="w-3.5 h-3.5 rounded-full border border-stone-300"
                              style={{ backgroundColor: col.hex }}
                              title={col.name}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="text-base font-bold text-stone-950 tabular-nums">{formatINR(prod.price)}</span>
                          {prod.originalPrice > prod.price && (
                            <span className="text-xs text-stone-400 line-through ml-1.5 tabular-nums">{formatINR(prod.originalPrice)}</span>
                          )}
                        </div>

                        <button
                          onClick={() => addToCart(prod, prod.sizes[0], prod.colors[0]?.name || 'Standard')}
                          className="px-3 py-1.5 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 text-xs font-semibold rounded transition-colors flex items-center gap-1"
                          aria-label={`Add ${prod.name} to bag`}
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Bag</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: PRODUCT DETAILS PAGE (Requirement 1: MULTIPLE IMAGES, COLOR SWITCHING, SIZES & MATRIX STOCK) */}
        {currentPage === 'product' && currentProduct && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Breadcrumb */}
            <nav className="text-xs text-stone-500 mb-6 flex items-center gap-1.5">
              <span className="cursor-pointer hover:underline" onClick={() => navigateTo('home')}>Home</span>
              <span>/</span>
              <span className="cursor-pointer hover:underline" onClick={() => navigateTo('shop')}>Shop</span>
              <span>/</span>
              <span
                className="capitalize cursor-pointer hover:underline"
                onClick={() => { setSelectedCategory(currentProduct.category); navigateTo('shop'); }}
              >
                {currentProduct.categoryLabel || currentProduct.category}
              </span>
              <span>/</span>
              <span className="text-stone-900 font-semibold truncate max-w-xs">{currentProduct.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Product Gallery: Displays photos for the currently selected color shade! */}
              <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
                <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible">
                  {currentColorImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                        activeImageIndex === idx ? 'border-[#4A0E17] scale-95 shadow' : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                      aria-label={`View angle thumbnail ${idx + 1}`}
                    >
                      <img
                        src={img}
                        alt={`Angle ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    </button>
                  ))}
                </div>

                <div className="flex-1 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 aspect-[3/4] relative shadow-md">
                  <img
                    src={currentColorImages[activeImageIndex] || currentProduct.image}
                    alt={currentProduct.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  {currentProduct.isNew && (
                    <span className="absolute top-4 left-4 bg-[#4A0E17] text-amber-200 text-xs font-bold px-3 py-1 rounded shadow">
                      New Arrival
                    </span>
                  )}
                  {activeColor && (
                    <span className="absolute bottom-4 left-4 bg-stone-900/80 backdrop-blur-sm text-stone-100 text-[11px] font-medium px-3 py-1 rounded-full shadow">
                      Shade: {activeColor}
                    </span>
                  )}
                </div>
              </div>

              {/* Product Configurations & Actions (Right) */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">{currentProduct.craft}</span>
                  <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 font-medium mt-1">
                    {currentProduct.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(currentProduct.rating) ? 'fill-current' : 'text-stone-300'}`} />
                      ))}
                    </div>
                    <span className="font-bold text-stone-800 tabular-nums">{currentProduct.rating}</span>
                    <span className="text-stone-400" aria-hidden="true">·</span>
                    <span className="text-stone-500 tabular-nums">{currentProduct.reviewsCount} Verified Patron Reviews</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-stone-950 tabular-nums">{formatINR(currentProduct.price)}</span>
                    {currentProduct.originalPrice > currentProduct.price && (
                      <span className="text-sm text-stone-400 line-through tabular-nums">{formatINR(currentProduct.originalPrice)}</span>
                    )}
                    <span className="text-xs text-emerald-700 font-bold ml-auto">
                      {isGstExclusive ? `+ ${gstRate}% GST applicable` : `Includes ${gstRate}% GST`}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Tamil Nadu shipping ₹{storeSettings.shippingTamilNadu} · Pan-India delivery ₹{storeSettings.shippingPanIndia}</span>
                  </p>
                </div>

                {/* Requirement 1: Color Selection with interactive image switching */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                    Available Shades: <span className="text-[#4A0E17] font-semibold">{activeColor}</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    {currentProduct.colors.map(c => (
                      <button
                        key={c.name}
                        onClick={() => {
                          setActiveColor(c.name);
                          setActiveImageIndex(0); // reset thumbnail index when switching color
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                          activeColor === c.name
                            ? 'border-[#4A0E17] bg-rose-50 text-[#4A0E17] font-semibold shadow-sm ring-1 ring-[#4A0E17]'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-stone-300" style={{ backgroundColor: c.hex }} />
                        <span>{c.name}</span>
                        {c.images && c.images.length > 0 && (
                          <span className="text-[9px] text-stone-400">({c.images.length} views)</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Requirement 1: Size Selection with Stock Availability per Variant */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Select Size: <span className="text-[#4A0E17]">{activeSize}</span>
                    </label>
                    <button
                      type="button"
                      className="text-[11px] text-amber-800 underline cursor-pointer font-medium"
                      onClick={() => showToast('Standard Indian atelier measurements. Sizing margins provided.')}
                    >
                      Sizing Guide
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {currentProduct.sizes.map(sz => {
                      const vStock = currentProduct.variantStock?.[`${activeColor}_${sz}`] ?? currentProduct.stock;
                      const isOutOfStock = vStock <= 0;

                      return (
                        <button
                          key={sz}
                          disabled={isOutOfStock}
                          onClick={() => setActiveSize(sz)}
                          className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                            isOutOfStock
                              ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed line-through'
                              : activeSize === sz
                              ? 'bg-[#4A0E17] text-amber-200 border-[#4A0E17] shadow-sm font-bold'
                              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          <div>{sz}</div>
                          {vStock > 0 && vStock <= 3 && (
                            <span className="text-[9px] text-amber-400 block -mt-0.5">{vStock} left</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Variant Inventory Status Indicator */}
                <div className="text-xs">
                  {activeVariantStock <= 0 ? (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Out of stock in <strong>{activeColor}</strong> (Size: {activeSize}). Please pick another shade or size.</span>
                    </div>
                  ) : activeVariantStock <= 3 ? (
                    <div className="p-2.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Hurry! Only <strong>{activeVariantStock} pieces</strong> remaining in {activeColor} ({activeSize}).</span>
                    </div>
                  ) : (
                    <p className="text-emerald-700 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>In Stock ({activeVariantStock} units ready for dispatch)</span>
                    </p>
                  )}
                </div>

                {/* Quantity & Add to Cart */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center border border-stone-300 rounded-lg bg-white w-32 justify-between px-3 py-2">
                    <button
                      onClick={() => setActiveQuantity(Math.max(1, activeQuantity - 1))}
                      className="text-stone-500 hover:text-stone-900"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-stone-900 tabular-nums">{activeQuantity}</span>
                    <button
                      disabled={activeQuantity >= activeVariantStock}
                      onClick={() => setActiveQuantity(Math.min(activeVariantStock, activeQuantity + 1))}
                      className="text-stone-500 hover:text-stone-900 disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    disabled={activeVariantStock <= 0}
                    onClick={() => {
                      addToCart(currentProduct, activeSize, activeColor, activeQuantity);
                    }}
                    className={`flex-1 py-3 px-6 text-xs tracking-widest uppercase font-semibold rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                      activeVariantStock <= 0
                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                        : 'bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{activeVariantStock <= 0 ? 'Sold Out' : 'Add To Bag'}</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(currentProduct.id)}
                    className={`p-3 rounded-lg border transition-colors ${
                      wishlist.includes(currentProduct.id)
                        ? 'border-[#4A0E17] bg-rose-50 text-[#4A0E17]'
                        : 'border-stone-300 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                    title="Save to Wishlist"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* OWNER QUICK EDIT ON PRODUCT DETAIL */}
                {isAdminAuthenticated && (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-amber-950 flex items-center gap-1.5">
                        <Edit className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>Owner Controls: {currentProduct.name}</span>
                      </p>
                      <p className="text-amber-800 text-[11px] mt-0.5">
                        Stock: {currentProduct.stock} · Price: {formatINR(currentProduct.price)} · {currentProduct.isNew ? '★ New Arrival' : 'Catalogue Piece'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleNewArrival(currentProduct)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold shadow-sm transition-colors ${
                          currentProduct.isNew ? 'bg-amber-200 text-amber-950 border border-amber-400' : 'bg-white border text-stone-700'
                        }`}
                      >
                        {currentProduct.isNew ? '★ New Arrival' : '+ Set New'}
                      </button>
                      <button
                        onClick={() => {
                          setProductForm(currentProduct);
                          setIsEditingProductModal(true);
                        }}
                        className="px-3.5 py-1.5 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 font-bold rounded-lg shadow-sm transition-colors"
                      >
                        Edit Details
                      </button>
                    </div>
                  </div>
                )}

                {/* WhatsApp & Stylist Connect */}
                <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-emerald-950">Inquire About This Ensemble</p>
                    <p className="text-emerald-800">Direct consultation with our senior stylist.</p>
                  </div>
                  <a
                    href={getWhatsAppUrl(`Namaste Dhasami Couture, I would like to inquire about ${currentProduct.name} (SKU: ${currentProduct.id}).`)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold whitespace-nowrap shadow-sm flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {/* Craftsmanship & Specifications Accordion */}
                <div className="border-t border-stone-200 pt-4 space-y-3 text-xs text-stone-600">
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="font-semibold text-stone-900">Craft Heritage</span>
                    <span>{currentProduct.craft}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="font-semibold text-stone-900">Fabric & Weave</span>
                    <span>{currentProduct.fabric}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="font-semibold text-stone-900">Dispatch Time</span>
                    <span>{currentProduct.leadTime}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-semibold text-stone-900">Atelier Guarantee</span>
                    <span className="text-amber-800 font-medium">100% Genuine Handcrafted Guarantee</span>
                  </div>
                </div>

                {/* Detailed Description */}
                {currentProduct.description && (
                  <div className="pt-2 text-xs leading-relaxed text-stone-600 border-t border-stone-100">
                    <p className="font-semibold text-stone-900 mb-1">Weaver's Chronicle:</p>
                    <p>{currentProduct.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: SHOPPING BAG / CART */}
        {currentPage === 'cart' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="font-serif text-3xl text-stone-900 mb-6">Your Shopping Bag ({totalCartCount})</h1>

            {cart.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
                <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <h2 className="font-serif text-xl font-medium text-stone-800">Your bag is currently empty</h2>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Discover our festive handloom curations and timeless bridal ensembles.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                  <button
                    onClick={() => navigateTo('shop')}
                    className="px-6 py-3 bg-[#4A0E17] text-amber-200 text-xs font-bold uppercase tracking-widest rounded-lg shadow"
                  >
                    Explore Curations
                  </button>
                  {wishlist.length > 0 && (
                    <button
                      onClick={() => navigateTo('wishlist')}
                      className="px-6 py-3 bg-white text-[#4A0E17] border border-[#4A0E17] text-xs font-bold uppercase tracking-widest rounded-lg shadow-sm hover:bg-rose-50 flex items-center gap-2"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>View Saved Wishlist ({wishlist.length})</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Cart Items List */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm divide-y divide-stone-100">
                  {cartDetailedItems.map(item => (
                    <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`} className="py-5 first:pt-0 last:pb-0 flex gap-4 sm:gap-6">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-28 object-cover rounded-lg border shrink-0 cursor-pointer"
                        onClick={() => navigateTo('product', item.productId)}
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                                {item.product.categoryLabel}
                              </span>
                              <h3
                                onClick={() => navigateTo('product', item.productId)}
                                className="font-serif text-sm sm:text-base font-semibold text-stone-900 hover:text-[#4A0E17] cursor-pointer"
                              >
                                {item.product.name}
                              </h3>
                            </div>
                            <span className="text-sm font-bold text-stone-950 tabular-nums">
                              {formatINR(item.totalItemPrice)}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                            <span>Size: <strong>{item.selectedSize}</strong></span>
                            <span>·</span>
                            <span>Shade: <strong>{item.selectedColor}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                            <button
                              onClick={() => updateCartQuantity(item.productId, item.selectedSize, item.selectedColor, -1)}
                              className="p-1.5 text-stone-600 hover:text-stone-900"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-bold tabular-nums">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.productId, item.selectedSize, item.selectedColor, 1)}
                              className="p-1.5 text-stone-600 hover:text-stone-900"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.productId, item.selectedSize, item.selectedColor)}
                            className="text-xs text-rose-700 hover:text-rose-900 font-medium flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
                  <h2 className="font-serif text-lg font-bold text-stone-900">Order Summary</h2>

                  {/* Promo code form */}
                  <form onSubmit={handleApplyCoupon} className="flex gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Enter promo coupon"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg uppercase font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-[#4A0E17]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-stone-900 text-stone-50 rounded-lg font-bold uppercase tracking-wider hover:bg-stone-800"
                    >
                      Apply
                    </button>
                  </form>

                  {/* Calculation Breakdown */}
                  <div className="space-y-2.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
                    <div className="flex justify-between">
                      <span>Bag Subtotal</span>
                      <span className="tabular-nums font-semibold">{formatINR(subtotal)}</span>
                    </div>

                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Privilege Discount ({appliedDiscount}%)</span>
                        <span className="tabular-nums">- {formatINR(discountAmount)}</span>
                      </div>
                    )}

                    {/* Requirement 4: GST Configuration Display */}
                    <div className="flex justify-between">
                      <span>
                        GST ({gstRate}%) {isGstExclusive ? '(Added separately)' : '(Inclusive in price)'}
                      </span>
                      <span className="tabular-nums font-semibold">
                        {isGstExclusive ? `+ ${formatINR(gstAmount)}` : `(Incl. ${formatINR(gstAmount)})`}
                      </span>
                    </div>

                    {/* Requirement 3: Location-based Shipping in Cart */}
                    <div className="flex justify-between">
                      <div>
                        <span>Shipping</span>
                        <p className="text-[10px] text-stone-400">
                          {isTamilNaduDelivery ? 'Tamil Nadu Rate' : 'Pan-India Rate'}
                        </p>
                      </div>
                      <span className="tabular-nums font-semibold">{formatINR(shippingCharge)}</span>
                    </div>

                    <div className="pt-3 border-t border-stone-200 flex justify-between text-base font-bold text-stone-900">
                      <span>Total Due</span>
                      <span className="tabular-nums text-lg text-[#4A0E17]">{formatINR(grandTotal)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigateTo('checkout')}
                    className="w-full py-3.5 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 font-bold text-xs uppercase tracking-widest rounded-lg shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] text-center text-stone-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>100% Pre-paid Online Security (Razorpay)</span>
                  </p>
                </div>
              </div>
            )}

            {/* Wishlist Link inside Cart View */}
            {wishlist.length > 0 && (
              <div className="mt-8 p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-amber-700 fill-current shrink-0" />
                  <span className="text-stone-700 font-medium">You have <strong>{wishlist.length} ensemble(s)</strong> saved in your Wishlist.</span>
                </div>
                <button
                  onClick={() => navigateTo('wishlist')}
                  className="text-[#4A0E17] font-bold hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>View Saved Wishlist ({wishlist.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW: CURATED WISHLIST SECTION */}
        {currentPage === 'wishlist' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-stone-200">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-amber-800 font-bold block mb-1">
                  Private Boutique Curation
                </span>
                <h1 className="font-serif text-3xl text-stone-900">Your Saved Wishlist ({wishlist.length})</h1>
                <p className="text-xs text-stone-500 mt-1 max-w-xl">
                  Handcrafted silhouettes, festive ensembles, and bridal couture saved for your celebratory moments.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateTo('shop')}
                  className="px-4 py-2 border border-stone-300 hover:border-stone-500 rounded-lg text-xs font-semibold text-stone-700 transition-colors"
                >
                  Continue Shopping
                </button>
                {wishlist.length > 0 && (
                  <button
                    onClick={() => {
                      setWishlist([]);
                      showToast('Your wishlist has been cleared.');
                    }}
                    className="px-3 py-2 text-rose-700 hover:text-rose-900 text-xs font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {wishlist.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 p-8 shadow-sm max-w-2xl mx-auto space-y-4">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-[#4A0E17]">
                  <Heart className="w-8 h-8 stroke-1 text-[#4A0E17]" />
                </div>
                <h2 className="font-serif text-2xl font-medium text-stone-800">Your Wishlist is currently empty</h2>
                <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                  As you browse our handcrafted Festive Kurti Sets, flared Anarkalis, and Bridal Lehengas, click the heart icon on any ensemble to save it here for later.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigateTo('shop')}
                    className="px-8 py-3.5 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg transition-all"
                  >
                    Discover Curations
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {wishlistProducts.map(prod => {
                    const defaultColor = prod.colors?.[0]?.name || 'Standard';
                    const defaultSize = prod.sizes?.[0] || 'Standard';

                    return (
                      <div
                        key={prod.id}
                        className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group relative"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                            onClick={() => navigateTo('product', prod.id)}
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                            {prod.isNew && (
                              <span className="bg-[#4A0E17] text-amber-200 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow">
                                New Arrival
                              </span>
                            )}
                            {prod.isBestseller && (
                              <span className="bg-amber-600 text-stone-950 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow">
                                Bestseller
                              </span>
                            )}
                          </div>

                          {/* Remove from Wishlist Button */}
                          <button
                            onClick={() => toggleWishlist(prod.id)}
                            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-rose-700 shadow flex items-center justify-center hover:bg-rose-50 transition-colors"
                            title="Remove from saved wishlist"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        </div>

                        {/* Product Details */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[10px] text-amber-800 uppercase tracking-widest font-bold">
                              {prod.categoryLabel}
                            </span>
                            <h3
                              onClick={() => navigateTo('product', prod.id)}
                              className="font-serif text-base font-semibold text-stone-900 hover:text-[#4A0E17] cursor-pointer mt-0.5 line-clamp-1"
                            >
                              {prod.name}
                            </h3>
                            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                              {prod.fabric} · {prod.craft}
                            </p>
                          </div>

                          <div className="space-y-2">
                            {/* Available Sizes Pills */}
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[10px] text-stone-400 mr-1">Sizes:</span>
                              {prod.sizes.slice(0, 4).map(sz => (
                                <span key={sz} className="text-[10px] font-medium bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
                                  {sz}
                                </span>
                              ))}
                              {prod.sizes.length > 4 && (
                                <span className="text-[10px] text-stone-400">+{prod.sizes.length - 4}</span>
                              )}
                            </div>

                            {/* Pricing */}
                            <div className="flex items-baseline justify-between pt-1 border-t border-stone-100">
                              <div className="flex items-baseline gap-2">
                                <span className="text-base font-bold text-stone-950 tabular-nums">
                                  {formatINR(prod.price)}
                                </span>
                                {prod.originalPrice > prod.price && (
                                  <span className="text-xs text-stone-400 line-through tabular-nums">
                                    {formatINR(prod.originalPrice)}
                                  </span>
                                )}
                              </div>
                              {prod.stock > 0 ? (
                                <span className="text-[10px] text-emerald-700 font-bold">In Stock</span>
                              ) : (
                                <span className="text-[10px] text-rose-700 font-bold">Out of Stock</span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                            <button
                              disabled={prod.stock <= 0}
                              onClick={() => {
                                addToCart(prod, defaultSize, defaultColor, 1);
                              }}
                              className={`py-2 px-3 rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition-all ${
                                prod.stock <= 0
                                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                  : 'bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200'
                              }`}
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>{prod.stock <= 0 ? 'Sold Out' : 'Add to Bag'}</span>
                            </button>

                            <button
                              onClick={() => navigateTo('product', prod.id)}
                              className="py-2 px-3 rounded-lg border border-stone-300 hover:border-[#4A0E17] text-stone-800 hover:text-[#4A0E17] font-semibold text-[11px] transition-colors text-center"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-500 text-center">
                  💡 Saved pieces remain preserved in your session. All online orders include express insured dispatch across India.
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: CHECKOUT PAGE (ONLINE PAYMENT ONLY, LOCATION SHIPPING, GST) */}
        {currentPage === 'checkout' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="font-serif text-3xl text-stone-900 mb-8">Secure Checkout & Atelier Dispatch</h1>

            <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Delivery Address Form */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
                <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-700" />
                  <span>1. Delivery Address & Contact</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={checkoutData.fullName}
                      onChange={(e) => setCheckoutData({ ...checkoutData, fullName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A0E17]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Phone Number (WhatsApp Verified) *</label>
                    <input
                      type="tel"
                      required
                      value={checkoutData.phone}
                      onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                      placeholder="9840123456"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A0E17]"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block font-semibold text-stone-700 mb-1">Email Address (Order Invoices & Tracking) *</label>
                  <input
                    type="email"
                    required
                    value={checkoutData.email}
                    onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A0E17]"
                  />
                </div>

                <div className="text-xs space-y-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">House / Flat / Door No. & Street *</label>
                    <input
                      type="text"
                      required
                      value={checkoutData.addressLine1}
                      onChange={(e) => setCheckoutData({ ...checkoutData, addressLine1: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A0E17]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Area / Landmark</label>
                    <input
                      type="text"
                      value={checkoutData.addressLine2}
                      onChange={(e) => setCheckoutData({ ...checkoutData, addressLine2: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A0E17]"
                    />
                  </div>
                </div>

                {/* Requirement 3: Location State selector triggering dynamic shipping */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={checkoutData.city}
                      onChange={(e) => setCheckoutData({ ...checkoutData, city: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A0E17]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">State (Determines Shipping Rate) *</label>
                    <select
                      value={checkoutData.state}
                      onChange={(e) => setCheckoutData({ ...checkoutData, state: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A0E17] bg-white font-medium"
                    >
                      {INDIAN_STATES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">PIN Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={checkoutData.pincode}
                      onChange={(e) => setCheckoutData({ ...checkoutData, pincode: e.target.value })}
                      placeholder="600018"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A0E17]"
                    />
                  </div>
                </div>

                {/* Requirement 5: Payment method notice — ONLINE PREPAYMENT ONLY (NO COD) */}
                <div className="pt-4 border-t border-stone-200">
                  <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2 mb-3">
                    <CreditCard className="w-5 h-5 text-amber-700" />
                    <span>2. Online Payment Gateway (Razorpay)</span>
                  </h2>

                  <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-300 text-xs text-stone-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                      <span className="font-bold text-stone-900">Online Prepayment Only (UPI · Cards · NetBanking · Wallets)</span>
                    </div>
                    <p className="text-stone-600 leading-relaxed">
                      To prevent fraudulent dispatch and ensure dedicated artisan handloom reservation, Cash on Delivery is not available. All orders are processed via 256-bit encrypted Razorpay protocols.
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Summary on Checkout */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
                <h2 className="font-serif text-lg font-bold text-stone-900">Order Items ({totalCartCount})</h2>

                <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto pr-1">
                  {cartDetailedItems.map(item => (
                    <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-10 h-14 object-cover rounded border"
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                        <div>
                          <p className="font-semibold text-stone-900 line-clamp-1">{item.product.name}</p>
                          <p className="text-[11px] text-stone-500">
                            {item.selectedColor} · Size {item.selectedSize} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold tabular-nums">{formatINR(item.totalItemPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5 text-xs text-stone-600 pt-3 border-t border-stone-100">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-semibold">{formatINR(subtotal)}</span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Privilege Discount ({appliedDiscount}%)</span>
                      <span className="tabular-nums">- {formatINR(discountAmount)}</span>
                    </div>
                  )}

                  {/* Requirement 4: GST Configuration Display at Checkout */}
                  <div className="flex justify-between">
                    <span>
                      GST ({gstRate}%) {isGstExclusive ? '(Added to total)' : '(Included in product prices)'}
                    </span>
                    <span className="tabular-nums font-semibold">
                      {isGstExclusive ? `+ ${formatINR(gstAmount)}` : `(Incl. ${formatINR(gstAmount)})`}
                    </span>
                  </div>

                  {/* Requirement 3: Location-based Shipping at Checkout */}
                  <div className="flex justify-between">
                    <div>
                      <span>Delivery Charge</span>
                      <p className="text-[10px] text-stone-500">
                        {isTamilNaduDelivery
                          ? `Tamil Nadu Rate (₹${storeSettings.shippingTamilNadu})`
                          : `Pan-India Rate (₹${storeSettings.shippingPanIndia})`}
                      </p>
                    </div>
                    <span className="tabular-nums font-semibold">{formatINR(shippingCharge)}</span>
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex justify-between text-base font-bold text-stone-900">
                    <span>Grand Total</span>
                    <span className="tabular-nums text-lg text-[#4A0E17]">{formatINR(grandTotal)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessingCheckout}
                  className="w-full py-3.5 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 font-bold text-xs uppercase tracking-widest rounded-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isProcessingCheckout ? 'Connecting Gateway...' : `Pay ${formatINR(grandTotal)} Now`}</span>
                </button>

                <p className="text-[10px] text-center text-stone-400">
                  By clicking Pay Now, your payment order will be initiated through Razorpay's secure checkout.
                </p>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 6: ORDER CONFIRMATION / RECEIPT */}
        {currentPage === 'confirmation' && confirmedOrder && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-xl text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-amber-800 font-bold">Patronage Confirmed</span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                  Thank You for Your Order
                </h1>
                <p className="text-xs text-stone-500 mt-1 font-mono">Order Reference: #{confirmedOrder.orderId}</p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Order Date:</span>
                  <span className="font-semibold text-stone-900">{confirmedOrder.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Payment Status:</span>
                  <span className="font-bold text-emerald-800">{confirmedOrder.paymentStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Payment Channel:</span>
                  <span className="font-semibold text-stone-900">Razorpay Online Prepayment</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Shipping Category:</span>
                  <span className="font-semibold text-stone-900">
                    {confirmedOrder.customer?.state?.toLowerCase().includes('tamil nadu') ? 'Tamil Nadu Express (₹50)' : 'Pan-India Express (₹100)'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                  <span>Grand Total Paid:</span>
                  <span className="text-[#4A0E17] tabular-nums">{formatINR(confirmedOrder.grandTotal)}</span>
                </div>
              </div>

              <div className="text-left text-xs text-stone-600 bg-[#FDFBF7] p-4 rounded-xl border border-stone-200/80 space-y-1">
                <p className="font-bold text-stone-900">Recipient & Delivery Information:</p>
                <p>{confirmedOrder.customer?.fullName} ({confirmedOrder.customer?.phone})</p>
                <p>{confirmedOrder.customer?.addressLine1}, {confirmedOrder.customer?.city}, {confirmedOrder.customer?.state} - {confirmedOrder.customer?.pincode}</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigateTo('home')}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold uppercase tracking-wider rounded-lg shadow"
                >
                  Return to Home
                </button>
                <a
                  href={getWhatsAppUrl(`Namaste Dhasami Couture, I would like to track my order #${confirmedOrder.orderId}.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Order Tracking</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 7: OUR HERITAGE PAGE */}
        {currentPage === 'about' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] text-[#4A0E17] font-semibold font-serif">Ancestral Lineage</span>
              <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-medium">The Chronicles of Dhasami</h1>
              <p className="text-xs text-stone-500 max-w-xl mx-auto">
                {aboutContent.headline}
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-xl aspect-video">
              <img
                src={aboutContent.guildImg}
                alt="Dhasami Atelier Artisans"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            </div>

            <div className="space-y-6 text-sm text-stone-700 leading-relaxed">
              {aboutContent.storyParagraphs?.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              {aboutContent.promises?.map((pr, i) => (
                <div key={i} className="p-6 bg-white rounded-2xl border border-stone-200/80 shadow-sm space-y-2">
                  <Award className="w-6 h-6 text-amber-700 mb-2" />
                  <h3 className="font-serif text-base font-bold text-stone-900">{pr.title}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">{pr.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 8: CONTACT & SALON APPOINTMENTS */}
        {currentPage === 'contact' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-[0.25em] text-[#4A0E17] font-semibold font-serif">Private Salon Experience</span>
              <h1 className="font-serif text-3xl text-stone-900">Boutique Appointments & Inquiries</h1>
              <p className="text-xs text-stone-500">Visit our flagship salon in Chennai or schedule a virtual bespoke styling consultation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6 text-xs text-stone-700">
                <h2 className="font-serif text-lg font-bold text-stone-900">Flagship Ateliers</h2>
                <div className="space-y-3">
                  <p className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>{storeSettings.flagshipAddress}</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{storeSettings.contactPhone}</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{storeSettings.contactEmail}</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex gap-4">
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase tracking-wider rounded-lg text-center flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Concierge</span>
                  </a>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <h2 className="font-serif text-lg font-bold text-stone-900">Schedule Bridal Appointment</h2>
                <form onSubmit={(e) => { e.preventDefault(); showToast('Appointment request received! Our concierge will call you.'); }} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
                    <input type="text" required placeholder="Smt. Ananya Rao" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A0E17]" />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                    <input type="text" required placeholder="+91 98401 23456" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A0E17]" />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Occasion / Silhouette of Interest</label>
                    <select className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-white">
                      {categoriesContent.map(cat => (
                        <option key={cat.key}>{cat.title}</option>
                      ))}
                      <option>Bridal Trousseau Consultation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Message</label>
                    <textarea rows={3} placeholder="Event dates, preferred shades, or custom sizing queries..." className="w-full px-3 py-2 border rounded-lg focus:outline-none"></textarea>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-[#4A0E17] text-amber-200 font-bold uppercase tracking-wider rounded-lg text-xs shadow hover:bg-[#2E070F]">
                    Submit Appointment Request
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 9: POLICIES */}
        {currentPage === 'policies' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-xs text-stone-700 leading-relaxed relative">
            {isAdminAuthenticated && (
              <button
                onClick={() => { setAdminTab('policies'); navigateTo('admin'); }}
                className="absolute top-4 right-4 bg-amber-400 text-stone-950 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Policies
              </button>
            )}

            <div className="text-center mb-8">
              <span className="text-xs uppercase tracking-[0.25em] text-[#4A0E17] font-semibold font-serif">Customer Care & Standards</span>
              <h1 className="font-serif text-3xl text-stone-900 mt-2">Boutique Policies</h1>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                {policiesContent.shippingHeading}
              </h2>
              <p>{policiesContent.shippingText}</p>
              <ul className="list-disc list-inside space-y-1 text-stone-600">
                {policiesContent.shippingPoints?.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
                {policiesContent.returnsHeading}
              </h2>
              <p>{policiesContent.returnsText}</p>
              <ul className="list-disc list-inside space-y-1 text-stone-600">
                {policiesContent.returnsPoints?.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                {policiesContent.privacyHeading}
              </h2>
              <p>{policiesContent.privacyText}</p>
            </div>
          </div>
        )}

        {/* =========================================================================
           VIEW 10: COMPLETE OWNER ADMIN DASHBOARD (EDIT EVERYTHING IN THE BROWSER)
           ========================================================================= */}
        {currentPage === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {!isAdminAuthenticated ? (
              <div className="max-w-md mx-auto bg-white rounded-2xl border border-stone-200 p-8 shadow-xl text-center space-y-4">
                <div className="w-12 h-12 bg-[#24050B] text-amber-300 rounded-full flex items-center justify-center mx-auto shadow">
                  <Lock className="w-6 h-6" />
                </div>
                <h1 className="font-serif text-2xl font-bold text-stone-900">Owner Access Portal</h1>
                <p className="text-xs text-stone-500">
                  Protected boutique command center. Authenticate with owner credentials to manage every detail on your website.
                </p>

                <form onSubmit={handleAdminLogin} className="space-y-3 pt-2 text-left text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Owner Email</label>
                    <input
                      type="email"
                      required
                      value={adminLoginForm.email}
                      onChange={(e) => setAdminLoginForm({ ...adminLoginForm, email: e.target.value })}
                      placeholder="owner@dhasamicouture.com"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A0E17]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={adminLoginForm.password}
                      onChange={(e) => setAdminLoginForm({ ...adminLoginForm, password: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A0E17]"
                    />
                  </div>

                  {adminLoginError && (
                    <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{adminLoginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 text-xs font-bold uppercase tracking-wider rounded-lg shadow mt-2"
                  >
                    Authenticate & Enter
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdminLoginForm({
                        email: 'owner@dhasamicouture.com',
                        password: 'DhasamiCouture@2026'
                      });
                      showToast('Credentials filled. Click "Authenticate & Enter" to sign in.');
                    }}
                    className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-700" />
                    <span>⚡ Fill Default Owner Credentials</span>
                  </button>
                </form>

                <div className="pt-3 border-t border-stone-200 text-[11px] text-stone-500 text-left space-y-1">
                  <p className="font-semibold text-stone-700">Initial Setup Credentials:</p>
                  <p>Email: <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">owner@dhasamicouture.com</code></p>
                  <p>Initial Password: <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">DhasamiCouture@2026</code></p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-4">
                  <div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase">Full Access Owner Studio</span>
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                      Atelier Website Studio
                    </h1>
                    <p className="text-xs text-stone-500">Edit every dress, category, shipping rate, GST configuration, hero banner, coupon, and policy.</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigateTo('home')}
                      className="px-3 py-2 border border-stone-300 text-xs font-semibold rounded-lg hover:bg-stone-100 flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Live Site</span>
                    </button>
                    <button
                      onClick={handleAdminLogout}
                      className="px-3 py-2 border border-stone-300 text-xs font-semibold rounded-lg hover:bg-stone-100 flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5 text-stone-600" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>

                {/* Dashboard Tabs */}
                <div className="flex items-center gap-1.5 border-b border-stone-200 overflow-x-auto pb-1 text-xs font-semibold">
                  {[
                    { id: 'products', label: `Dresses (${products.length})` },
                    { id: 'categories', label: `Categories (${categoriesContent.length})` },
                    { id: 'orders', label: `Orders (${adminOrders.length})` },
                    { id: 'shipping-tax', label: 'Shipping & GST' },
                    { id: 'announcements', label: `Announcements (${announcements.length})` },
                    { id: 'hero', label: 'Hero & Banner' },
                    { id: 'about', label: 'Heritage & About' },
                    { id: 'testimonials', label: `Reviews (${testimonials.length})` },
                    { id: 'coupons', label: `Coupons (${coupons.length})` },
                    { id: 'policies', label: 'Policies' },
                    { id: 'settings', label: 'Store & Social' },
                    { id: 'gateway', label: 'Razorpay Gateway' },
                    { id: 'security', label: 'Security' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setAdminTab(tab.id as any)}
                      className={`px-3 py-2 rounded-t-lg transition-colors whitespace-nowrap ${
                        adminTab === tab.id
                          ? 'border-b-2 border-[#4A0E17] text-[#4A0E17] bg-white font-bold shadow-sm'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* TAB 1: PRODUCTS / DRESSES MANAGEMENT (Requirement 1: Multiple Images, Colors, Sizes & Stock Matrix) */}
                {adminTab === 'products' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-stone-50 p-4 rounded-xl border border-stone-200">
                      <div>
                        <h3 className="font-bold text-stone-900 text-xs">Total Registered Catalogue ({products.length} ensembles)</h3>
                        <p className="text-[11px] text-stone-500">Add dresses with multiple angles, color-specific photos, size choices, and variant stock.</p>
                      </div>
                      <button
                        onClick={() => {
                          setProductForm({
                            name: '',
                            category: categoriesContent[0]?.key || 'kurtis',
                            categoryLabel: categoriesContent[0]?.title || 'Festive Kurti Sets',
                            price: 4999,
                            originalPrice: 6500,
                            rating: 5.0,
                            reviewsCount: 1,
                            isBestseller: false,
                            isNew: true,
                            isPublished: true,
                            stock: 5,
                            colors: [{ name: 'Heritage Crimson', hex: '#8B1E3F', images: [] }],
                            sizes: ['XS', 'S', 'M', 'L', 'XL'],
                            variantStock: {},
                            fabric: 'Pure Chanderi Silk Blend',
                            craft: 'Handcrafted Needlework',
                            leadTime: 'Ready to dispatch within 24 hours',
                            description: 'Artisanal festive silhouette.',
                            image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
                            additionalImages: []
                          });
                          setIsEditingProductModal(true);
                        }}
                        className="px-4 py-2 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 text-xs font-bold rounded-lg shadow flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Dress</span>
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-stone-100/70 text-stone-600 font-semibold border-b border-stone-200">
                            <tr>
                              <th className="p-3">SKU</th>
                              <th className="p-3">Photo & Design</th>
                              <th className="p-3">Category</th>
                              <th className="p-3">Price</th>
                              <th className="p-3 text-center">New Arrival Status</th>
                              <th className="p-3 text-center">In-Stock Count</th>
                              <th className="p-3 text-center">Published</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 text-stone-800">
                            {products.map(prod => (
                              <tr key={prod.id} className="hover:bg-stone-50">
                                <td className="p-3 font-mono font-bold text-stone-600">{prod.id}</td>
                                <td className="p-3 font-medium flex items-center gap-2">
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="w-10 h-12 object-cover rounded border shrink-0"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                  />
                                  <div>
                                    <p className="line-clamp-1 font-semibold">{prod.name}</p>
                                    <p className="text-[10px] text-stone-400">
                                      {prod.colors?.length || 0} shades · {prod.sizes.join(', ')}
                                    </p>
                                  </div>
                                </td>
                                <td className="p-3 capitalize">{prod.categoryLabel || prod.category}</td>
                                <td className="p-3 font-bold tabular-nums">{formatINR(prod.price)}</td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => handleToggleNewArrival(prod)}
                                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                                      prod.isNew
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                        : 'bg-stone-100 text-stone-400 hover:text-stone-700'
                                    }`}
                                  >
                                    {prod.isNew ? '★ New Arrival' : 'Mark New'}
                                  </button>
                                </td>
                                <td className="p-3 text-center">
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      onClick={() => handleAdminStockAdjust(prod.id, -1)}
                                      className="w-5 h-5 bg-stone-100 hover:bg-stone-200 rounded font-bold text-center"
                                    >
                                      -
                                    </button>
                                    <span className={`px-2 py-0.5 rounded font-bold tabular-nums ${
                                      prod.stock <= 3 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                      {prod.stock}
                                    </span>
                                    <button
                                      onClick={() => handleAdminStockAdjust(prod.id, 1)}
                                      className="w-5 h-5 bg-stone-900 hover:bg-stone-800 text-white rounded font-bold text-center"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => handleTogglePublished(prod)}
                                    className={`p-1 rounded ${prod.isPublished !== false ? 'text-emerald-700' : 'text-stone-400'}`}
                                  >
                                    {prod.isPublished !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  </button>
                                </td>
                                <td className="p-3 text-right space-x-1 whitespace-nowrap">
                                  <button
                                    onClick={() => {
                                      setProductForm(prod);
                                      setIsEditingProductModal(true);
                                    }}
                                    className="p-1.5 hover:bg-stone-200 rounded text-stone-700"
                                    title="Edit Product"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                    className="p-1.5 hover:bg-rose-100 rounded text-rose-700"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: CATEGORY & COLLECTION MANAGEMENT (Requirement 8) */}
                {adminTab === 'categories' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-stone-50 p-4 rounded-xl border border-stone-200">
                      <div>
                        <h3 className="font-bold text-stone-900 text-xs">Couture Categories & Curations ({categoriesContent.length})</h3>
                        <p className="text-[11px] text-stone-500">
                          Create, edit, or delete store categories. All categories automatically populate the header navigation, mobile menu, and product filters.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setCategoryForm({
                            key: '',
                            title: '',
                            subtitle: '',
                            description: '',
                            img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
                            subcategories: [],
                            order: categoriesContent.length + 1
                          });
                          setIsEditingCategoryModal(true);
                        }}
                        className="px-4 py-2 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 text-xs font-bold rounded-lg shadow flex items-center gap-1.5"
                      >
                        <FolderPlus className="w-4 h-4" />
                        <span>Add New Category</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoriesContent.map(cat => {
                        const count = products.filter(p => p.category === cat.key).length;
                        return (
                          <div key={cat.key} className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between">
                            <div>
                              <div className="relative h-40 bg-stone-100">
                                <img
                                  src={cat.img}
                                  alt={cat.title}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                />
                                <span className="absolute top-2 right-2 bg-stone-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                  {count} Products
                                </span>
                              </div>
                              <div className="p-4 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                                    key: {cat.key}
                                  </span>
                                  <span className="text-[10px] text-amber-800 font-semibold uppercase">{cat.subtitle}</span>
                                </div>
                                <h3 className="font-serif text-base font-bold text-stone-900">{cat.title}</h3>
                                {cat.description && (
                                  <p className="text-xs text-stone-500 line-clamp-2">{cat.description}</p>
                                )}
                                {cat.subcategories && cat.subcategories.length > 0 && (
                                  <div className="pt-2 flex flex-wrap gap-1">
                                    {cat.subcategories.map(sc => (
                                      <span key={sc} className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                                        {sc}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="p-4 pt-0 border-t border-stone-100 mt-3 flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setCategoryForm(cat);
                                  setIsEditingCategoryModal(true);
                                }}
                                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-semibold flex items-center gap-1"
                              >
                                <Edit className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.key, cat.title)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-xs font-semibold flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 3: ORDERS MANAGEMENT */}
                {adminTab === 'orders' && (
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="font-serif text-lg font-bold text-stone-900">Orders & Payment Verification</h2>
                        <p className="text-xs text-stone-500">View real customer orders, verified payment receipts, and delivery states.</p>
                      </div>
                      <button
                        onClick={loadAdminOrders}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold"
                      >
                        Refresh Orders
                      </button>
                    </div>

                    {adminOrders.length === 0 ? (
                      <div className="text-center py-12 text-stone-400 text-xs">
                        <FileText className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                        <p>No orders recorded in database yet.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-stone-100 border rounded-xl overflow-hidden text-xs">
                        {adminOrders.map(ord => (
                          <div key={ord.orderId} className="p-4 hover:bg-stone-50 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <span className="font-mono font-bold text-[#4A0E17] text-sm">#{ord.orderId}</span>
                                <span className="text-stone-400 ml-2">· {ord.date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                                  ord.paymentStatus === 'PAID'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {ord.paymentStatus}
                                </span>
                                <select
                                  value={ord.fulfillmentStatus}
                                  onChange={async (e) => {
                                    const newFulfill = e.target.value;
                                    await fetch(`/api/admin/orders/${ord.orderId}/fulfillment`, {
                                      method: 'PUT',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${adminToken}`
                                      },
                                      body: JSON.stringify({ fulfillmentStatus: newFulfill })
                                    });
                                    loadAdminOrders();
                                    showToast(`Order #${ord.orderId} status updated to ${newFulfill}.`);
                                  }}
                                  className="px-2 py-1 border rounded text-xs bg-white font-semibold"
                                >
                                  <option value="Processing">Processing</option>
                                  <option value="Dispatched">Dispatched</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-stone-600">
                              <div>
                                <p className="font-semibold text-stone-900">{ord.customer?.fullName}</p>
                                <p>{ord.customer?.phone} · {ord.customer?.email}</p>
                                <p>{ord.customer?.addressLine1}, {ord.customer?.city}, {ord.customer?.state} - {ord.customer?.pincode}</p>
                              </div>
                              <div className="space-y-1">
                                <p>Items: {ord.items?.map((i: any) => `${i.name} (${i.selectedColor}·${i.selectedSize} × ${i.quantity})`).join(', ')}</p>
                                <p>Shipping: <strong>{formatINR(ord.shippingCharge)}</strong> ({ord.customer?.state?.toLowerCase().includes('tamil nadu') ? 'Tamil Nadu' : 'Pan-India'})</p>
                                <p>GST: <strong>{formatINR(ord.gstAmount)}</strong></p>
                                <p className="text-sm font-bold text-stone-900">Total: {formatINR(ord.grandTotal)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: LOCATION-BASED SHIPPING & GST CONFIGURATION (Requirements 3 & 4) */}
                {adminTab === 'shipping-tax' && (
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-stone-900">Location-Based Shipping & GST Tax Settings</h2>
                      <p className="text-xs text-stone-500">Configure Indian state delivery charges and flexible Goods & Services Tax (GST) rates.</p>
                    </div>

                    <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
                      {/* Shipping Section */}
                      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
                        <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                          <Truck className="w-4 h-4 text-amber-700" />
                          <span>Location-Based Courier Delivery Rates</span>
                        </h3>
                        <p className="text-stone-500">
                          Automatically applied based on the customer's delivery state at checkout. Free shipping thresholds are removed.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Tamil Nadu Orders Shipping (₹) *</label>
                            <input
                              type="number"
                              required
                              min="0"
                              value={settingsForm.shippingTamilNadu ?? 50}
                              onChange={(e) => setSettingsForm({ ...settingsForm, shippingTamilNadu: Number(e.target.value) })}
                              className="w-full px-3 py-2 border rounded-lg bg-white"
                            />
                            <p className="text-[10px] text-stone-400 mt-1">Default: ₹50</p>
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Other Indian States (Pan-India) Shipping (₹) *</label>
                            <input
                              type="number"
                              required
                              min="0"
                              value={settingsForm.shippingPanIndia ?? 100}
                              onChange={(e) => setSettingsForm({ ...settingsForm, shippingPanIndia: Number(e.target.value) })}
                              className="w-full px-3 py-2 border rounded-lg bg-white"
                            />
                            <p className="text-[10px] text-stone-400 mt-1">Default: ₹100</p>
                          </div>
                        </div>
                      </div>

                      {/* GST Configuration */}
                      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
                        <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                          <Percent className="w-4 h-4 text-amber-700" />
                          <span>Goods & Services Tax (GST) Configuration</span>
                        </h3>
                        <p className="text-stone-500">
                          Configure the applicable GST percentage and choose whether tax is inclusive (already inside product prices) or exclusive (added separately at checkout).
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Applicable GST Rate (%) *</label>
                            <input
                              type="number"
                              required
                              min="0"
                              max="40"
                              value={settingsForm.gstRate ?? 12}
                              onChange={(e) => setSettingsForm({ ...settingsForm, gstRate: Number(e.target.value) })}
                              className="w-full px-3 py-2 border rounded-lg bg-white"
                            />
                            <p className="text-[10px] text-stone-400 mt-1">Default: 12% (Standard Indian apparel slab)</p>
                          </div>

                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">GST Pricing Treatment *</label>
                            <select
                              value={settingsForm.gstPricingMode || 'inclusive'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, gstPricingMode: e.target.value as any })}
                              className="w-full px-3 py-2 border rounded-lg bg-white font-medium"
                            >
                              <option value="inclusive">Inclusive (Prices already include GST)</option>
                              <option value="exclusive">Exclusive (Add GST on top of product prices at checkout)</option>
                            </select>
                            <p className="text-[10px] text-stone-400 mt-1">
                              {settingsForm.gstPricingMode === 'exclusive'
                                ? 'Customer pays Subtotal + GST + Shipping'
                                : 'Customer pays Subtotal + Shipping (Tax shown transparently as included)'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 font-bold uppercase tracking-wider rounded-lg shadow"
                      >
                        Save Shipping & Tax Rules
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 5: ANNOUNCEMENTS MARQUEE */}
                {adminTab === 'announcements' && (
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-stone-900">Manage Scrolling Announcement Marquee</h2>
                      <p className="text-xs text-stone-500">The single-line scrolling bar appears directly below the header.</p>
                    </div>

                    <form onSubmit={handleAddAnnouncement} className="flex gap-3 text-xs">
                      <input
                        type="text"
                        required
                        value={newAnnouncementText}
                        onChange={(e) => setNewAnnouncementText(e.target.value)}
                        placeholder="e.g. ⚜️ NEW FESTIVE ENSEMBLES LIVE · FREE STYLING CONSULTATION"
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 font-bold uppercase tracking-wider rounded-lg shadow"
                      >
                        Add Message
                      </button>
                    </form>

                    <div className="divide-y divide-stone-100 border rounded-xl overflow-hidden text-xs">
                      {announcements.map((ann, idx) => (
                        <div key={ann.id} className="p-3 flex items-center justify-between gap-4 bg-white hover:bg-stone-50">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-stone-400">#{idx + 1}</span>
                            <span className="font-medium text-stone-800">{ann.text}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleAnnouncement(ann)}
                              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                ann.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-500'
                              }`}
                            >
                              {ann.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              onClick={() => handleDeleteAnnouncement(ann.id)}
                              className="p-1 text-rose-700 hover:bg-rose-50 rounded"
                              title="Delete announcement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 6: HERO BANNER */}
                {adminTab === 'hero' && (
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-stone-900">Customize Homepage Campaign Banner</h2>
                      <p className="text-xs text-stone-500">Edit titles, subtitle, background image, and button category targets.</p>
                    </div>

                    <form onSubmit={handleSaveHeroContent} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Kicker Header</label>
                        <input
                          type="text"
                          value={heroForm.kicker}
                          onChange={(e) => setHeroForm({ ...heroForm, kicker: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">Headline Part 1</label>
                          <input
                            type="text"
                            value={heroForm.headline}
                            onChange={(e) => setHeroForm({ ...heroForm, headline: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg font-serif text-sm"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">Headline Part 2 (Italic)</label>
                          <input
                            type="text"
                            value={heroForm.headlineItalic}
                            onChange={(e) => setHeroForm({ ...heroForm, headlineItalic: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg font-serif italic text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Description Paragraph</label>
                        <textarea
                          rows={3}
                          value={heroForm.description}
                          onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Background Image URL or Upload</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={heroForm.bgImage}
                            onChange={(e) => setHeroForm({ ...heroForm, bgImage: e.target.value })}
                            className="flex-1 px-3 py-2 border rounded-lg"
                          />
                          <input
                            type="file"
                            ref={heroImageInputRef}
                            accept="image/*"
                            onChange={(e) => handleImageFileUpload(e, 'hero')}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => heroImageInputRef.current?.click()}
                            className="px-3 py-2 border rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center gap-1 font-semibold"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 font-bold uppercase tracking-wider rounded-lg shadow"
                      >
                        Save Hero Banner
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 7: ABOUT & HERITAGE */}
                {adminTab === 'about' && (
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-stone-900">Edit Heritage Story & Atelier Promises</h2>
                      <p className="text-xs text-stone-500">Update your brand chronicles and artisan guild storytelling.</p>
                    </div>

                    <form onSubmit={handleSaveAboutContent} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Kicker</label>
                        <input
                          type="text"
                          value={aboutForm.kicker}
                          onChange={(e) => setAboutForm({ ...aboutForm, kicker: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Headline</label>
                        <input
                          type="text"
                          value={aboutForm.headline}
                          onChange={(e) => setAboutForm({ ...aboutForm, headline: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg font-serif"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Story Paragraph 1</label>
                        <textarea
                          rows={3}
                          value={aboutForm.storyParagraphs[0] || ''}
                          onChange={(e) => {
                            const paras = [...aboutForm.storyParagraphs];
                            paras[0] = e.target.value;
                            setAboutForm({ ...aboutForm, storyParagraphs: paras });
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Story Paragraph 2</label>
                        <textarea
                          rows={3}
                          value={aboutForm.storyParagraphs[1] || ''}
                          onChange={(e) => {
                            const paras = [...aboutForm.storyParagraphs];
                            paras[1] = e.target.value;
                            setAboutForm({ ...aboutForm, storyParagraphs: paras });
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 font-bold uppercase tracking-wider rounded-lg shadow"
                      >
                        Save Heritage Story
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 8: TESTIMONIALS */}
                {adminTab === 'testimonials' && (
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-stone-900">Patron Reviews & Testimonials</h2>
                      <p className="text-xs text-stone-500">Manage client reviews displayed on the homepage.</p>
                    </div>

                    <form onSubmit={handleAddTestimonial} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 text-xs">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Review Quote *</label>
                        <textarea
                          rows={2}
                          required
                          value={newTestimonialForm.quote}
                          onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, quote: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">Author Name *</label>
                          <input
                            type="text"
                            required
                            value={newTestimonialForm.author}
                            onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, author: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">City</label>
                          <input
                            type="text"
                            value={newTestimonialForm.city}
                            onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, city: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg bg-white"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="py-2 px-5 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 font-bold uppercase tracking-wider rounded-lg shadow"
                      >
                        Add Review
                      </button>
                    </form>

                    <div className="divide-y divide-stone-100 border rounded-xl overflow-hidden text-xs">
                      {testimonials.map(t => (
                        <div key={t.id} className="p-4 flex items-center justify-between gap-4 bg-white">
                          <div>
                            <p className="italic text-stone-700">"{t.quote}"</p>
                            <p className="font-bold text-stone-900 mt-1">{t.author} · {t.city}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteTestimonial(t.id)}
                            className="p-1.5 text-rose-700 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 9: COUPONS */}
                {adminTab === 'coupons' && (
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-stone-900">Manage Discount Coupons</h2>
                      <p className="text-xs text-stone-500">Create promotional codes verified on server checkout.</p>
                    </div>

                    <form onSubmit={handleAddCoupon} className="p-4 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Coupon Code *</label>
                        <input
                          type="text"
                          required
                          value={newCouponForm.code}
                          onChange={(e) => setNewCouponForm({ ...newCouponForm, code: e.target.value.toUpperCase() })}
                          placeholder="e.g. DIWALI20"
                          className="w-full px-3 py-2 border rounded-lg bg-white uppercase font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Discount % *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="90"
                          value={newCouponForm.discountPercent}
                          onChange={(e) => setNewCouponForm({ ...newCouponForm, discountPercent: Number(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Description</label>
                        <input
                          type="text"
                          value={newCouponForm.description}
                          onChange={(e) => setNewCouponForm({ ...newCouponForm, description: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg bg-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="py-2.5 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 font-bold uppercase tracking-wider rounded-lg shadow"
                      >
                        Create Coupon
                      </button>
                    </form>

                    <div className="divide-y divide-stone-100 border rounded-xl overflow-hidden text-xs">
                      {coupons.map(cpn => (
                        <div key={cpn.id} className="p-3.5 flex items-center justify-between gap-4 bg-white">
                          <div>
                            <span className="font-mono font-bold text-sm bg-stone-100 px-2 py-0.5 rounded text-[#4A0E17]">{cpn.code}</span>
                            <span className="font-bold text-emerald-700 ml-3">{cpn.discountPercent}% OFF</span>
                            <span className="text-stone-500 ml-2">· {cpn.description}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteCoupon(cpn.id)}
                            className="p-1 text-rose-700 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 10: POLICIES */}
                {adminTab === 'policies' && (
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-stone-900">Customize Boutique Policies</h2>
                      <p className="text-xs text-stone-500">Edit delivery guarantees, return terms, and privacy protocols.</p>
                    </div>

                    <form onSubmit={handleSavePoliciesContent} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Shipping Policy Text</label>
                        <textarea
                          rows={2}
                          value={policiesForm.shippingText}
                          onChange={(e) => setPoliciesForm({ ...policiesForm, shippingText: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Returns & Exchange Text</label>
                        <textarea
                          rows={2}
                          value={policiesForm.returnsText}
                          onChange={(e) => setPoliciesForm({ ...policiesForm, returnsText: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Privacy & Security Text</label>
                        <textarea
                          rows={2}
                          value={policiesForm.privacyText}
                          onChange={(e) => setPoliciesForm({ ...policiesForm, privacyText: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 font-bold uppercase tracking-wider rounded-lg shadow"
                      >
                        Save Policies
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 11: STORE & SOCIAL SETTINGS */}
                {adminTab === 'settings' && (
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-stone-900">Boutique & Social Media Configurations</h2>
                      <p className="text-xs text-stone-500">Update your verified WhatsApp number, Instagram handle, brand display name, and salon details.</p>
                    </div>

                    <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">Brand Display Name (Header)</label>
                          <input
                            type="text"
                            required
                            value={settingsForm.brandDisplayName || 'Dhasami Couture'}
                            onChange={(e) => setSettingsForm({ ...settingsForm, brandDisplayName: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg font-serif italic text-sm"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">Brand Subtitle</label>
                          <input
                            type="text"
                            required
                            value={settingsForm.brandSubtitle || 'HAUTE COUTURE · CHENNAI'}
                            onChange={(e) => setSettingsForm({ ...settingsForm, brandSubtitle: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg uppercase tracking-wider"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">WhatsApp Business Phone (with Country Code)</label>
                          <input
                            type="text"
                            required
                            value={settingsForm.whatsappNumber}
                            onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                            placeholder="919840123456"
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">Instagram Profile Handle</label>
                          <input
                            type="text"
                            required
                            value={settingsForm.instagramHandle}
                            onChange={(e) => setSettingsForm({ ...settingsForm, instagramHandle: e.target.value, instagramUrl: `https://instagram.com/${e.target.value.replace('@','')}` })}
                            placeholder="dhasamicouture"
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Instagram URL</label>
                        <input
                          type="url"
                          required
                          value={settingsForm.instagramUrl}
                          onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">Concierge Email</label>
                          <input
                            type="email"
                            required
                            value={settingsForm.contactEmail}
                            onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">Concierge Phone Numbers</label>
                          <input
                            type="text"
                            required
                            value={settingsForm.contactPhone}
                            onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Flagship Salon Address</label>
                        <input
                          type="text"
                          required
                          value={settingsForm.flagshipAddress}
                          onChange={(e) => setSettingsForm({ ...settingsForm, flagshipAddress: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 font-bold uppercase tracking-wider rounded-lg shadow"
                      >
                        Save Boutique Details
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 12: RAZORPAY GATEWAY */}
                {adminTab === 'gateway' && (
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-stone-900">Razorpay Payment Gateway Setup</h2>
                      <p className="text-xs text-stone-500">Configure your business credentials from your approved Razorpay merchant account.</p>
                    </div>

                    <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Razorpay Key ID</label>
                        <input
                          type="text"
                          value={settingsForm.razorpayKeyId || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, razorpayKeyId: e.target.value })}
                          placeholder="rzp_test_... or rzp_live_..."
                          className="w-full px-3 py-2 border rounded-lg font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Razorpay Key Secret (Server-Encrypted)</label>
                        <input
                          type="password"
                          value={settingsForm.razorpayKeySecret || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, razorpayKeySecret: e.target.value })}
                          placeholder={settingsForm.razorpayKeySecretMasked || '••••••••••••••••'}
                          className="w-full px-3 py-2 border rounded-lg font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Gateway Mode</label>
                        <select
                          value={settingsForm.gatewayMode || 'test'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, gatewayMode: e.target.value as any })}
                          className="w-full px-3 py-2 border rounded-lg bg-white"
                        >
                          <option value="test">Sandbox / Test Mode (rzp_test_...)</option>
                          <option value="live">Live Production (rzp_live_...)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 font-bold uppercase tracking-wider rounded-lg shadow"
                      >
                        Save Gateway Settings
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 13: SECURITY & PASSWORD */}
                {adminTab === 'security' && (
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-stone-900">Owner Security & Access Keys</h2>
                      <p className="text-xs text-stone-500">Change your secure owner master password.</p>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4 text-xs max-w-md">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Current Password *</label>
                        <input
                          type="password"
                          required
                          value={passwordChangeForm.currentPassword}
                          onChange={(e) => setPasswordChangeForm({ ...passwordChangeForm, currentPassword: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">New Password (min 8 characters) *</label>
                        <input
                          type="password"
                          required
                          minLength={8}
                          value={passwordChangeForm.newPassword}
                          onChange={(e) => setPasswordChangeForm({ ...passwordChangeForm, newPassword: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 font-bold uppercase tracking-wider rounded-lg shadow"
                      >
                        Update Owner Password
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MODAL: EDIT PRODUCT (Requirement 1: Multiple Images, Colors with Images, Sizes & Variant Stock) */}
        {isEditingProductModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-3 border-b border-stone-200">
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  {productForm.id ? `Edit Dress: ${productForm.name}` : 'Add New Couture Dress'}
                </h2>
                <button onClick={() => setIsEditingProductModal(false)} className="text-stone-400 hover:text-stone-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProductModal} className="space-y-5 text-xs">
                
                {/* Basic Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Ensemble Name *</label>
                    <input
                      type="text"
                      required
                      value={productForm.name || ''}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="Gulmohar Chanderi Kurti Set"
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Category *</label>
                    <select
                      value={productForm.category || categoriesContent[0]?.key}
                      onChange={(e) => {
                        const cat = categoriesContent.find(c => c.key === e.target.value);
                        setProductForm({
                          ...productForm,
                          category: e.target.value,
                          categoryLabel: cat?.title || e.target.value
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      {categoriesContent.map(cat => (
                        <option key={cat.key} value={cat.key}>{cat.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={productForm.price || ''}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Original / MRP Price (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={productForm.originalPrice || ''}
                      onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Fabric & Craft */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Fabric & Weave</label>
                    <input
                      type="text"
                      value={productForm.fabric || ''}
                      onChange={(e) => setProductForm({ ...productForm, fabric: e.target.value })}
                      placeholder="Chanderi Cotton-Silk blend"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Craft Heritage</label>
                    <input
                      type="text"
                      value={productForm.craft || ''}
                      onChange={(e) => setProductForm({ ...productForm, craft: e.target.value })}
                      placeholder="Gotta Patti & Zardozi"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Primary Photos & Angles */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block font-bold text-stone-800">
                      Product Photos (Front view, back view, close-ups, angles)
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 bg-stone-900 text-stone-100 rounded text-xs font-semibold flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Image
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, 'product')}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Main Cover Photo URL *</label>
                    <input
                      type="text"
                      required
                      value={productForm.image || ''}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Additional Angle Photo URLs (Comma-separated)</label>
                    <textarea
                      rows={2}
                      value={productForm.additionalImages?.join(', ') || ''}
                      onChange={(e) => setProductForm({
                        ...productForm,
                        additionalImages: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      placeholder="https://angle1.jpg, https://angle2.jpg..."
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                </div>

                {/* Requirement 1: Colors & Color-Specific Photos */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-stone-800">Available Color Shades</h4>
                      <p className="text-[11px] text-stone-500">Add shades and attach color-specific photo galleries.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newC = { name: 'New Shade', hex: '#8B1E3F', images: [] };
                        setProductForm(prev => ({
                          ...prev,
                          colors: [...(prev.colors || []), newC]
                        }));
                      }}
                      className="px-3 py-1 bg-[#4A0E17] text-amber-200 rounded text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Shade
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={colorImageInputRef}
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e, 'color')}
                    className="hidden"
                  />

                  <div className="space-y-3">
                    {productForm.colors?.map((col, cIdx) => (
                      <div key={cIdx} className="p-3 bg-white border rounded-lg space-y-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={col.hex}
                            onChange={(e) => {
                              const copy = [...(productForm.colors || [])];
                              copy[cIdx].hex = e.target.value;
                              setProductForm({ ...productForm, colors: copy });
                            }}
                            className="w-8 h-8 rounded border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={col.name}
                            onChange={(e) => {
                              const copy = [...(productForm.colors || [])];
                              copy[cIdx].name = e.target.value;
                              setProductForm({ ...productForm, colors: copy });
                            }}
                            placeholder="Shade Name (e.g. Peacock Teal)"
                            className="flex-1 px-3 py-1.5 border rounded text-xs font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const copy = productForm.colors?.filter((_, i) => i !== cIdx);
                              setProductForm({ ...productForm, colors: copy });
                            }}
                            className="p-1 text-rose-700 hover:bg-rose-50 rounded"
                            title="Remove Shade"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Shade-specific photos */}
                        <div className="pl-11 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-stone-500 font-medium">
                              Photos for this shade ({col.images?.length || 0})
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveEditingColorIndex(cIdx);
                                colorImageInputRef.current?.click();
                              }}
                              className="text-[10px] text-amber-800 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <Upload className="w-3 h-3" /> Upload for this shade
                            </button>
                          </div>
                          <input
                            type="text"
                            value={col.images?.join(', ') || ''}
                            onChange={(e) => {
                              const copy = [...(productForm.colors || [])];
                              copy[cIdx].images = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setProductForm({ ...productForm, colors: copy });
                            }}
                            placeholder="URLs for this shade: https://img1.jpg, https://img2.jpg..."
                            className="w-full px-2 py-1 border rounded text-[11px] font-mono text-stone-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirement 1: Sizes Manager */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-stone-800">Available Sizes</h4>
                      <p className="text-[11px] text-stone-500">e.g. XS, S, M, L, XL, XXL, Custom</p>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={productForm.sizes?.join(', ') || ''}
                    onChange={(e) => {
                      const newSizes = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setProductForm({ ...productForm, sizes: newSizes });
                    }}
                    placeholder="XS, S, M, L, XL, XXL"
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  />
                </div>

                {/* Requirement 1: Stock Availability Matrix per Color x Size */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div>
                    <h4 className="font-bold text-stone-800">Stock per Shade & Size Combination</h4>
                    <p className="text-[11px] text-stone-500">
                      Set specific inventory for each variant combination. Total stock will be automatically calculated.
                    </p>
                  </div>

                  <div className="bg-white border rounded-lg p-3 max-h-52 overflow-y-auto divide-y divide-stone-100">
                    {productForm.colors?.map(col =>
                      productForm.sizes?.map(sz => {
                        const variantKey = `${col.name}_${sz}`;
                        const currentVal = productForm.variantStock?.[variantKey] ?? 1;

                        return (
                          <div key={variantKey} className="py-1.5 flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: col.hex }} />
                              <strong>{col.name}</strong> · Size {sz}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-stone-400">Qty:</span>
                              <input
                                type="number"
                                min="0"
                                value={currentVal}
                                onChange={(e) => {
                                  const updatedMatrix = { ...(productForm.variantStock || {}) };
                                  updatedMatrix[variantKey] = Number(e.target.value);
                                  setProductForm({ ...productForm, variantStock: updatedMatrix });
                                }}
                                className="w-16 px-2 py-1 border rounded text-right tabular-nums font-bold"
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Description & Craftsmanship Chronicles</label>
                  <textarea
                    rows={3}
                    value={productForm.description || ''}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Artisan handloom details..."
                  />
                </div>

                {/* Status Toggles */}
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(productForm.isNew)}
                      onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })}
                      className="rounded text-[#4A0E17]"
                    />
                    <span className="font-semibold text-stone-800">Mark as New Arrival (Displayed on Homepage)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isPublished !== false}
                      onChange={(e) => setProductForm({ ...productForm, isPublished: e.target.checked })}
                      className="rounded text-[#4A0E17]"
                    />
                    <span className="font-semibold text-stone-800">Published (Visible to Customers)</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingProductModal(false)}
                    className="px-4 py-2 border rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 font-bold uppercase tracking-wider rounded-lg shadow"
                  >
                    Save Ensemble
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT CATEGORY (Requirement 8) */}
        {isEditingCategoryModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5">
              <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  {categoryForm.key ? `Edit Category: ${categoryForm.title}` : 'Add New Couture Category'}
                </h2>
                <button onClick={() => setIsEditingCategoryModal(false)} className="text-stone-400 hover:text-stone-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCategoryModal} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category Title *</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                      setCategoryForm({
                        ...categoryForm,
                        title,
                        key: categoryForm.key || slug
                      });
                    }}
                    placeholder="e.g. Festive Kurti Sets"
                    className="w-full px-3 py-2 border rounded-lg font-serif"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Unique Identifier Key / Slug *</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.key || ''}
                    onChange={(e) => setCategoryForm({ ...categoryForm, key: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-') })}
                    placeholder="e.g. kurtis"
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Subtitle / Weave Style</label>
                  <input
                    type="text"
                    value={categoryForm.subtitle || ''}
                    onChange={(e) => setCategoryForm({ ...categoryForm, subtitle: e.target.value })}
                    placeholder="e.g. Chanderi & Hand Block"
                    className="w-full px-3 py-2 border rounded-lg uppercase tracking-wider"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={categoryForm.description || ''}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category Image URL or Upload</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={categoryForm.img || ''}
                      onChange={(e) => setCategoryForm({ ...categoryForm, img: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="file"
                      ref={categoryImageInputRef}
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, 'category')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => categoryImageInputRef.current?.click()}
                      className="px-3 py-2 border rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center gap-1 font-semibold"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Subcategories</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={subcategoryInput}
                      onChange={(e) => setSubcategoryInput(e.target.value)}
                      placeholder="Add subcategory (e.g. A-Line Sets)"
                      className="flex-1 px-3 py-1.5 border rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (subcategoryInput.trim()) {
                          setCategoryForm({
                            ...categoryForm,
                            subcategories: [...(categoryForm.subcategories || []), subcategoryInput.trim()]
                          });
                          setSubcategoryInput('');
                        }
                      }}
                      className="px-3 py-1.5 bg-stone-900 text-stone-100 rounded-lg font-bold"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {categoryForm.subcategories?.map((sc, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-full text-[11px]">
                        <span>{sc}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryForm({
                              ...categoryForm,
                              subcategories: categoryForm.subcategories?.filter((_, idx) => idx !== i)
                            });
                          }}
                          className="text-stone-400 hover:text-stone-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingCategoryModal(false)}
                    className="px-4 py-2 border rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 font-bold uppercase tracking-wider rounded-lg shadow"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* FLOATING BOUTIQUE OWNER ACCESS & QUICK CONTROLS (BOTTOM-RIGHT) */}
      <div className="fixed bottom-6 right-6 z-40">
        {isAdminAuthenticated ? (
          <div className="relative">
            {/* Quick Menu Popup */}
            {isOwnerQuickMenuOpen && (
              <div className="absolute bottom-14 right-0 w-80 bg-[#1A0307] text-[#EEDFCB] border border-amber-600/50 rounded-2xl shadow-2xl p-3.5 space-y-2 animate-in fade-in slide-in-from-bottom-2 text-xs">
                <div className="px-2 py-1.5 border-b border-amber-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-bold text-amber-200">Owner Live Customizer</span>
                  </div>
                  <button
                    onClick={() => setIsOwnerQuickMenuOpen(false)}
                    className="text-stone-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setProductForm({
                        name: '',
                        category: categoriesContent[0]?.key || 'kurtis',
                        categoryLabel: categoriesContent[0]?.title || 'Festive Kurti Sets',
                        price: 4999,
                        originalPrice: 6500,
                        rating: 5.0,
                        reviewsCount: 1,
                        isBestseller: false,
                        isNew: true,
                        isPublished: true,
                        stock: 5,
                        colors: [{ name: 'Heritage Crimson', hex: '#8B1E3F', images: [] }],
                        sizes: ['XS', 'S', 'M', 'L', 'XL'],
                        variantStock: {},
                        fabric: 'Pure Chanderi Silk Blend',
                        craft: 'Handcrafted Needlework',
                        leadTime: 'Ready to dispatch within 24 hours',
                        description: 'Artisanal festive silhouette.',
                        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
                        additionalImages: []
                      });
                      setIsEditingProductModal(true);
                      setIsOwnerQuickMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left rounded-lg hover:bg-white/10 flex items-center gap-2.5 text-amber-100 font-semibold"
                  >
                    <Plus className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>＋ Add New Dress</span>
                  </button>

                  <button
                    onClick={() => {
                      setAdminTab('categories');
                      navigateTo('admin');
                      setIsOwnerQuickMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left rounded-lg hover:bg-white/10 flex items-center gap-2.5 text-amber-100"
                  >
                    <FolderPlus className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Manage Categories & Curations</span>
                  </button>

                  <button
                    onClick={() => {
                      setAdminTab('shipping-tax');
                      navigateTo('admin');
                      setIsOwnerQuickMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left rounded-lg hover:bg-white/10 flex items-center gap-2.5 text-amber-100"
                  >
                    <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Location Shipping & GST Rates</span>
                  </button>

                  <button
                    onClick={() => {
                      setAdminTab('announcements');
                      navigateTo('admin');
                      setIsOwnerQuickMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left rounded-lg hover:bg-white/10 flex items-center gap-2.5 text-amber-100"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Edit Announcement Marquee</span>
                  </button>

                  <button
                    onClick={() => {
                      setAdminTab('settings');
                      navigateTo('admin');
                      setIsOwnerQuickMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left rounded-lg hover:bg-white/10 flex items-center gap-2.5 text-amber-100"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Update WhatsApp & Instagram</span>
                  </button>

                  <button
                    onClick={() => {
                      setAdminTab('orders');
                      navigateTo('admin');
                      setIsOwnerQuickMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left rounded-lg hover:bg-white/10 flex items-center gap-2.5 text-amber-100"
                  >
                    <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Orders & Payments ({adminOrders.length})</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-amber-900/60 flex items-center justify-between">
                  <button
                    onClick={() => {
                      navigateTo('admin');
                      setIsOwnerQuickMenuOpen(false);
                    }}
                    className="text-[11px] text-amber-300 hover:underline font-semibold"
                  >
                    Full Atelier Dashboard →
                  </button>
                  <button
                    onClick={() => {
                      handleAdminLogout();
                      setIsOwnerQuickMenuOpen(false);
                    }}
                    className="text-[11px] text-rose-300 hover:text-rose-200 flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              </div>
            )}

            {/* Trigger Button */}
            <button
              onClick={() => setIsOwnerQuickMenuOpen(!isOwnerQuickMenuOpen)}
              className="bg-[#24050B] hover:bg-[#380A12] text-amber-200 border-2 border-amber-500/80 px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 transition-all transform hover:scale-105 font-serif"
              title="Owner Quick Controls"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold tracking-wide">Owner Controls</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isOwnerQuickMenuOpen ? 'rotate-90' : '-rotate-90'}`} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              navigateTo('admin');
            }}
            className="bg-[#24050B] hover:bg-[#380A12] text-[#EEDFCB] border border-amber-700/60 hover:border-amber-400 px-3.5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold transition-all group"
            title="Atelier Owner Access"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Owner Mode</span>
          </button>
        )}
      </div>

      {/* IN-PAGE OWNER LOGIN MODAL */}
      {isOwnerLoginModalOpen && !isAdminAuthenticated && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-4 relative">
            <button
              onClick={() => setIsOwnerLoginModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-[#24050B] text-amber-300 rounded-full flex items-center justify-center mx-auto shadow">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-xl font-bold text-stone-900">Owner Access Portal</h2>
              <p className="text-xs text-stone-500">
                Sign in to manage categories, dresses, location-based shipping, GST, and store settings.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Owner Email</label>
                <input
                  type="email"
                  required
                  value={adminLoginForm.email}
                  onChange={(e) => setAdminLoginForm({ ...adminLoginForm, email: e.target.value })}
                  placeholder="owner@dhasamicouture.com"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A0E17]"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={adminLoginForm.password}
                  onChange={(e) => setAdminLoginForm({ ...adminLoginForm, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A0E17]"
                />
              </div>

              {adminLoginError && (
                <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminLoginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#4A0E17] hover:bg-[#2E070F] text-amber-200 font-bold uppercase tracking-wider rounded-lg shadow mt-2"
              >
                Sign In & Unlock Owner Controls
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminLoginForm({
                    email: 'owner@dhasamicouture.com',
                    password: 'DhasamiCouture@2026'
                  });
                  showToast('Owner credentials loaded! Click "Sign In" to continue.');
                }}
                className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Key className="w-3.5 h-3.5 text-amber-700" />
                <span>⚡ Auto-fill Default Owner Credentials</span>
              </button>

              <div className="pt-2 text-center border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsOwnerLoginModalOpen(false);
                    navigateTo('admin');
                  }}
                  className="text-[11px] text-[#4A0E17] hover:underline font-semibold"
                >
                  Go to Dedicated Owner Studio Page →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING WHATSAPP STYLIST BUTTON (BOTTOM-LEFT) */}
      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 left-6 z-40 bg-[#25D366] hover:bg-[#1EBE5D] text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 group transition-all transform hover:scale-105"
        title="Chat with Boutique Stylist"
      >
        <MessageCircle className="w-5 h-5 fill-current shrink-0" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-bold pl-0 group-hover:pl-1">
          Chat With Stylist
        </span>
      </a>

      {/* LUXURY FOOTER WITH WHATSAPP & INSTAGRAM INTEGRATION */}
      <footer className="bg-[#1A0307] text-[#EADCC9]/90 pt-16 pb-12 border-t-2 border-amber-700/40 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-amber-950">
          
          <div className="lg:col-span-2 space-y-4">
            <span className="font-serif italic text-2xl tracking-wide font-normal text-[#EEDFCB] block">
              {storeSettings.brandDisplayName || 'Dhasami Couture'}
            </span>
            <p className="text-stone-300 text-xs leading-relaxed max-w-sm">
              Authentic South Asian handloom heritage. Handcrafted festive kurtis, flared organza Anarkalis, and bespoke bridal lehengas crafted by generational master weavers across India.
            </p>
            <div className="pt-2 text-stone-400 space-y-1 text-[11px]">
              <p>📍 Flagship Salon: {storeSettings.flagshipAddress}</p>
              <p>📞 Concierge: {storeSettings.contactPhone}</p>
              <p>✉️ Orders: {storeSettings.contactEmail}</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={storeSettings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-amber-700/30 text-amber-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@{storeSettings.instagramHandle}</span>
              </a>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 hover:text-emerald-100 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Atelier</span>
              </a>
            </div>
          </div>

          {/* Dynamic Curations links in footer */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-amber-300">Curations</h3>
            <ul className="space-y-2 text-stone-300">
              {categoriesContent.map(cat => (
                <li key={cat.key}>
                  <button onClick={() => { setSelectedCategory(cat.key); navigateTo('shop'); }} className="hover:text-amber-200 text-left">
                    {cat.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-amber-300">Customer Care</h3>
            <ul className="space-y-2 text-stone-300">
              <li><button onClick={() => navigateTo('cart')} className="hover:text-amber-200">Shopping Bag ({totalCartCount})</button></li>
              <li><button onClick={() => navigateTo('wishlist')} className="hover:text-amber-200">Saved Wishlist ({wishlist.length})</button></li>
              <li><button onClick={() => navigateTo('policies')} className="hover:text-amber-200">Express Insured Shipping</button></li>
              <li><button onClick={() => navigateTo('policies')} className="hover:text-amber-200">7-Day Exchange Guarantee</button></li>
              <li><button onClick={() => navigateTo('policies')} className="hover:text-amber-200">Artisan Authenticity Guarantee</button></li>
              <li><button onClick={() => navigateTo('about')} className="hover:text-amber-200">Our Weaving Heritage</button></li>
              <li><button onClick={() => navigateTo('contact')} className="hover:text-amber-200">Book Salon Appointment</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-amber-300">Privilege Circle</h3>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              Subscribe for private festive previews, wedding trousseau trunk shows, and bespoke styling tips.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); showToast('Subscribed to Dhasami Privilege Circle!'); }} className="space-y-2">
              <input
                type="email"
                required
                placeholder="Your email address"
                className="w-full px-3 py-2 bg-[#2D0911] border border-amber-800/60 rounded text-stone-100 placeholder-stone-400 focus:outline-none text-xs"
              />
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-stone-950 font-bold uppercase tracking-wider text-[11px] rounded transition-all"
              >
                Join Privilege Circle
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} {storeSettings.brandDisplayName || 'Dhasami Couture'} Private Limited. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> 100% Genuine Handcrafted Pieces</span>
            <span>·</span>
            <span>Razorpay Secure Prepayment</span>
            <span>·</span>
            <button
              onClick={() => {
                if (isAdminAuthenticated) navigateTo('admin');
                else setIsOwnerLoginModalOpen(true);
              }}
              className="text-amber-300 underline font-semibold hover:text-amber-100"
            >
              {isAdminAuthenticated ? 'Owner Dashboard' : 'Owner Login'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
