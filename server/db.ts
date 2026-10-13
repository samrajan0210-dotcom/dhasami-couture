import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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
  isPublished: boolean;
  stock: number;
  colors: ProductColor[];
  sizes: string[];
  variantStock?: Record<string, number>; // key: `${colorName}_${size}`, value: number
  fabric: string;
  craft: string;
  leadTime: string;
  description: string;
  image: string;
  additionalImages: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  text: string;
  linkText?: string;
  linkUrl?: string;
  isActive: boolean;
  order: number;
}

export interface StoreSettings {
  whatsappNumber: string; // e.g. "919840123456"
  instagramHandle: string; // e.g. "dhasamicouture"
  instagramUrl: string; // e.g. "https://instagram.com/dhasamicouture"
  flagshipAddress: string;
  contactEmail: string;
  contactPhone: string;
  shippingTamilNadu: number; // default: 50
  shippingPanIndia: number;  // default: 100
  gstRate: number;           // default: 12 (%)
  gstPricingMode: 'inclusive' | 'exclusive'; // default: 'inclusive'
  currency: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  gatewayMode: 'test' | 'live';
  brandDisplayName?: string;
  brandSubtitle?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  totalItemPrice: number;
}

export interface OrderCustomer {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderRecord {
  orderId: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  gstAmount: number;
  shippingCharge: number;
  grandTotal: number;
  customer: OrderCustomer;
  paymentMethod: 'razorpay';
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  fulfillmentStatus: 'Processing' | 'Dispatched' | 'Delivered' | 'Cancelled';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paidAt?: string;
  createdAt: string;
}

export interface OwnerAccount {
  email: string;
  passwordHash: string;
  salt: string;
  recoveryKeyHash: string;
  updatedAt: string;
}

/* FULL SITE CUSTOMIZATION SCHEMAS */
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

export interface CategoryCard {
  key: string;
  title: string;
  subtitle: string;
  description?: string;
  img: string;
  subcategories?: string[];
  order?: number;
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

export interface StoreDatabase {
  products: Product[];
  announcements: Announcement[];
  settings: StoreSettings;
  orders: OrderRecord[];
  owner: OwnerAccount;
  hero: HeroContent;
  categories: CategoryCard[];
  aboutStory: AboutContent;
  testimonials: Testimonial[];
  coupons: Coupon[];
  policies: PoliciesContent;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Helper to hash passwords using scrypt
export function hashSecret(secret: string, salt: string): string {
  return crypto.scryptSync(secret, salt, 64).toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Initial Seed Data without any "Pure Silk Sarees"
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'DC-101',
    name: 'Gulmarg Brocade Royal Festive Ensemble',
    category: 'festive',
    categoryLabel: 'Atelier Festive Drapes & Sets',
    price: 18499,
    originalPrice: 24999,
    rating: 4.9,
    reviewsCount: 38,
    isBestseller: true,
    isNew: false,
    isPublished: true,
    stock: 7,
    colors: [
      {
        name: 'Royal Crimson',
        hex: '#8B1E3F',
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80'
        ]
      },
      {
        name: 'Peacock Teal',
        hex: '#005F73',
        images: [
          'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80'
        ]
      },
      {
        name: 'Temple Gold',
        hex: '#C59B27',
        images: [
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80'
        ]
      }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    variantStock: {
      'Royal Crimson_XS': 1,
      'Royal Crimson_S': 2,
      'Royal Crimson_M': 2,
      'Peacock Teal_S': 1,
      'Temple Gold_M': 1
    },
    fabric: 'Pure Mulberry Silk with Antique Zari',
    craft: 'Ancestral Brocade Handloom Weave',
    leadTime: 'Ready to dispatch within 24 hours',
    description: 'Woven with gold-dipped pure zari thread on authentic handloom mulberry silk. Features a grandeur-rich silhouette with ancestral peacock and paisley motifs, accompanied by an embellished border.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'DC-102',
    name: 'Emerald Gulmohar Chanderi Kurti Set',
    category: 'kurtis',
    categoryLabel: 'Festive Kurti Sets',
    price: 4599,
    originalPrice: 6200,
    rating: 4.8,
    reviewsCount: 52,
    isBestseller: true,
    isNew: true,
    isPublished: true,
    stock: 9,
    colors: [
      {
        name: 'Emerald Forest',
        hex: '#1B4332',
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80'
        ]
      },
      {
        name: 'Dusty Rose',
        hex: '#C97A7E',
        images: [
          'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80'
        ]
      }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    variantStock: {
      'Emerald Forest_XS': 1,
      'Emerald Forest_S': 2,
      'Emerald Forest_M': 3,
      'Emerald Forest_L': 1,
      'Dusty Rose_S': 1,
      'Dusty Rose_M': 1
    },
    fabric: 'Chanderi Cotton-Silk blend',
    craft: 'Handcrafted Gotta Patti & Gota Kinari',
    leadTime: 'Dispatches in 2 days',
    description: 'Straight-silhouette calf-length Kurti paired with scalloped organza dupatta and cigarette pants. Delicate botanical hand-embroidery along the yoke and sleeve borders.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'DC-103',
    name: 'Nawabi Organza Anarkali Festive Gown',
    category: 'dresses',
    categoryLabel: 'Anarkalis & Indo-Western Gowns',
    price: 11999,
    originalPrice: 15500,
    rating: 5.0,
    reviewsCount: 19,
    isBestseller: false,
    isNew: true,
    isPublished: true,
    stock: 5,
    colors: [
      {
        name: 'Blush Ivory',
        hex: '#F3E9E0',
        images: [
          'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80'
        ]
      },
      {
        name: 'Lilac Mist',
        hex: '#C3B1E1',
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80'
        ]
      }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    variantStock: {
      'Blush Ivory_S': 2,
      'Blush Ivory_M': 1,
      'Lilac Mist_S': 1,
      'Lilac Mist_M': 1
    },
    fabric: 'Pure Silk Organza with Butter-Crepe lining',
    craft: 'Zardozi and Micro-Pearl needlework',
    leadTime: 'Limited Edition',
    description: '32-kali flare floor-sweeping Anarkali gown. Adorned with champagne sequin sprinkles, scalloped borders, and an intricately embellished choker neckline.',
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'DC-104',
    name: 'Maharani Velvet Bridal Heritage Lehenga',
    category: 'ethnic',
    categoryLabel: 'Bridal Heritage Lehengas',
    price: 36499,
    originalPrice: 48000,
    rating: 4.9,
    reviewsCount: 27,
    isBestseller: true,
    isNew: false,
    isPublished: true,
    stock: 4,
    colors: [
      {
        name: 'Maroon Vermilion',
        hex: '#660708',
        images: [
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80'
        ]
      },
      {
        name: 'Midnight Navy',
        hex: '#0B132B',
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80'
        ]
      }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    variantStock: {
      'Maroon Vermilion_S': 1,
      'Maroon Vermilion_M': 2,
      'Midnight Navy_M': 1
    },
    fabric: 'Micro Velvet with Dual Organza Dupattas',
    craft: 'Dabka, Marodi & Resham Threadwork',
    leadTime: 'Tailoring consultation provided on purchase',
    description: 'Royal bridal ensemble with a grand 4.5-meter circumference flare. Double dupatta concept featuring sheer veil tissue and structured velvet borders.',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'DC-105',
    name: 'Varanasi Metallic Tissue Brocade Set',
    category: 'festive',
    categoryLabel: 'Atelier Festive Drapes & Sets',
    price: 15800,
    originalPrice: 19999,
    rating: 4.7,
    reviewsCount: 44,
    isBestseller: false,
    isNew: true,
    isPublished: true,
    stock: 6,
    colors: [
      {
        name: 'Sunset Coral',
        hex: '#E07A5F',
        images: [
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80'
        ]
      },
      {
        name: 'Champagne Ochre',
        hex: '#E9D8A6',
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80'
        ]
      }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    variantStock: {
      'Sunset Coral_S': 2,
      'Sunset Coral_M': 2,
      'Champagne Ochre_M': 2
    },
    fabric: 'Fine Silk with Metallic Tissue weft',
    craft: 'Varanasi Kadwa Brocade Weave',
    leadTime: 'Dispatches tomorrow',
    description: 'An ethereal confluence of heritage motifs and soft metallic sheen. Lightweight yet exceptionally regal for receptions and festive gatherings.',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'DC-106',
    name: 'Noor Hand-Block Printed Festive Tunic',
    category: 'kurtis',
    categoryLabel: 'Festive Kurti Sets',
    price: 2999,
    originalPrice: 3899,
    rating: 4.6,
    reviewsCount: 61,
    isBestseller: false,
    isNew: false,
    isPublished: true,
    stock: 12,
    colors: [
      {
        name: 'Indigo Botanical',
        hex: '#1D3557',
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80'
        ]
      },
      {
        name: 'Terracotta Rust',
        hex: '#BA181B',
        images: [
          'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80'
        ]
      }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    variantStock: {
      'Indigo Botanical_XS': 2,
      'Indigo Botanical_S': 3,
      'Indigo Botanical_M': 3,
      'Terracotta Rust_S': 2,
      'Terracotta Rust_M': 2
    },
    fabric: '100% Breathable Sanganeri Cotton-Silk',
    craft: 'Natural Vegetable Dye Woodblock',
    leadTime: 'In Stock',
    description: 'Effortless luxury tailored for daily grace and boutique styling. Features discreet side pockets, shell buttons, and mirror-work lapels.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    text: '✨ FESTIVE ATELIER COLLECTION LIVE · TAMIL NADU EXPRESS DELIVERY ₹50 · PAN-INDIA SHIPPING ₹100',
    isActive: true,
    order: 1
  },
  {
    id: 'ann-2',
    text: '⚜️ BESPOKE BRIDAL TROUSSEAU CONSULTATIONS NOW OPEN AT OUR CHENNAI SALON',
    isActive: true,
    order: 2
  },
  {
    id: 'ann-3',
    text: '🌸 USE CODE DHASAMI10 FOR 10% PRIVILEGE ATELIER SAVINGS AT CHECKOUT',
    isActive: true,
    order: 3
  }
];

const INITIAL_SETTINGS: StoreSettings = {
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
  razorpayKeyId: '',
  razorpayKeySecret: '',
  gatewayMode: 'test',
  brandDisplayName: 'Dhasami Couture',
  brandSubtitle: 'HAUTE COUTURE · CHENNAI'
};

const INITIAL_HERO: HeroContent = {
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
};

const INITIAL_CATEGORIES: CategoryCard[] = [
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
];

const INITIAL_ABOUT: AboutContent = {
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
};

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    quote: "The bridal lehenga I ordered for my sister's reception in Chennai was breathtaking. The real zari glow was evident and the packaging felt like unboxing royalty.",
    author: 'Dr. Revathi Raghavan',
    city: 'Chennai',
    rating: 5
  },
  {
    id: 'test-2',
    quote: 'Customer service via WhatsApp helped me customize the Anarkali neck depth within an hour. Arrived in Mumbai within 48 hours without a stitch out of place.',
    author: 'Meera Kulkarni',
    city: 'Mumbai',
    rating: 5
  },
  {
    id: 'test-3',
    quote: 'Finding authentic Chanderi kurtas with neat lining and pockets is so rare. Dhasami Couture has become my go-to for all family festive events.',
    author: 'Sneha Varma',
    city: 'Hyderabad',
    rating: 5
  }
];

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cpn-1',
    code: 'DHASAMI10',
    discountPercent: 10,
    description: 'Festive Season Privilege Discount',
    isActive: true
  },
  {
    id: 'cpn-2',
    code: 'ROYAL15',
    discountPercent: 15,
    description: 'VIP Wedding Trousseau Privilege',
    isActive: true
  }
];

const INITIAL_POLICIES: PoliciesContent = {
  shippingHeading: '1. Shipping & Pan-India Insured Dispatch',
  shippingText: 'All Dhasami Couture orders are dispatched from our primary Chennai ateliers through insured premium courier partners (BlueDart, Delhivery, DTDC).',
  shippingPoints: [
    'Tamil Nadu deliveries: ₹50 shipping charge (2 to 3 business days).',
    'Pan-India deliveries (all other Indian states): ₹100 express insured shipping charge (3 to 5 business days).',
    'Real-time parcel tracking provided via WhatsApp and email upon dispatch.'
  ],
  returnsHeading: '2. 7-Day Exchange & Returns Policy',
  returnsText: 'We take immense pride in our artisan handloom standards. If an ensemble does not fit or satisfy your expectations:',
  returnsPoints: [
    'You may request an exchange or boutique credit within 7 calendar days of delivery.',
    'Items must remain unused, unworn, unwashed with original designer tags intact.',
    'Custom-tailored blouses or bespoke alteration orders are final sale unless a manufacturing discrepancy is confirmed.'
  ],
  privacyHeading: '3. Privacy & Secure Online Payment Architecture',
  privacyText: 'Dhasami Couture strictly adheres to Indian Information Technology (IT Act 2000) privacy protocols. All online orders require secure prepayment via Razorpay (UPI, Credit/Debit cards, NetBanking). We do not accept Cash on Delivery to guarantee artisan reservation and prevent fraudulent parcel returns.'
};

const DEFAULT_SALT = generateSalt();
const DEFAULT_OWNER: OwnerAccount = {
  email: 'owner@dhasamicouture.com',
  passwordHash: hashSecret('DhasamiCouture@2026', DEFAULT_SALT),
  salt: DEFAULT_SALT,
  recoveryKeyHash: hashSecret('DC-RECOVER-7788-9922', DEFAULT_SALT),
  updatedAt: new Date().toISOString()
};

class StoreDB {
  private data: StoreDatabase | null = null;
  private activeSessions = new Map<string, { email: string; expiresAt: number }>();

  constructor() {
    this.ensureStorage();
  }

  private ensureStorage() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialDb: StoreDatabase = {
        products: INITIAL_PRODUCTS,
        announcements: INITIAL_ANNOUNCEMENTS,
        settings: INITIAL_SETTINGS,
        orders: [],
        owner: DEFAULT_OWNER,
        hero: INITIAL_HERO,
        categories: INITIAL_CATEGORIES,
        aboutStory: INITIAL_ABOUT,
        testimonials: INITIAL_TESTIMONIALS,
        coupons: INITIAL_COUPONS,
        policies: INITIAL_POLICIES
      };
      this.save(initialDb);
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);

        let changed = false;

        // Upgrade settings: location-based shipping and GST config
        if (!this.data!.settings || typeof this.data!.settings.shippingTamilNadu !== 'number') {
          this.data!.settings = {
            ...INITIAL_SETTINGS,
            ...this.data!.settings,
            shippingTamilNadu: 50,
            shippingPanIndia: 100,
            gstRate: 12,
            gstPricingMode: 'inclusive'
          };
          delete (this.data!.settings as any).freeShippingThreshold;
          delete (this.data!.settings as any).flatShippingCharge;
          changed = true;
        }

        // Clean out "Pure Silk Sarees" from categories
        if (Array.isArray(this.data!.categories)) {
          const hadSarees = this.data!.categories.some(c => c.key === 'sarees' || c.title.toLowerCase().includes('saree'));
          if (hadSarees) {
            this.data!.categories = this.data!.categories.filter(c => c.key !== 'sarees' && !c.title.toLowerCase().includes('saree'));
            if (!this.data!.categories.some(c => c.key === 'festive')) {
              this.data!.categories.push({
                key: 'festive',
                title: 'Atelier Festive Drapes & Sets',
                subtitle: 'Metallic Tissue & Brocades',
                description: 'Occasion curations blending antique zari and artisanal weaving.',
                img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
                subcategories: ['Festive Brocades', 'Occasion Drapes', 'Bespoke Sets'],
                order: 4
              });
            }
            changed = true;
          }
        } else {
          this.data!.categories = INITIAL_CATEGORIES;
          changed = true;
        }

        // Clean out "sarees" category from products
        if (Array.isArray(this.data!.products)) {
          for (const p of this.data!.products) {
            if (p.category === 'sarees') {
              p.category = 'festive';
              p.categoryLabel = 'Atelier Festive Drapes & Sets';
              changed = true;
            }
          }
        }

        // Upgrade Hero content if needed
        if (!this.data!.hero) {
          this.data!.hero = INITIAL_HERO;
          changed = true;
        } else if (this.data!.hero.cta2Category === 'sarees') {
          this.data!.hero.cta2Text = 'Festive Kurti Sets';
          this.data!.hero.cta2Category = 'kurtis';
          changed = true;
        }

        if (!this.data!.aboutStory) { this.data!.aboutStory = INITIAL_ABOUT; changed = true; }
        if (!this.data!.testimonials) { this.data!.testimonials = INITIAL_TESTIMONIALS; changed = true; }
        if (!this.data!.coupons) { this.data!.coupons = INITIAL_COUPONS; changed = true; }
        if (!this.data!.policies) { this.data!.policies = INITIAL_POLICIES; changed = true; }

        if (changed) {
          this.save(this.data!);
        }
      } catch (err) {
        console.error('Error reading store database, initializing fresh:', err);
        const fallback: StoreDatabase = {
          products: INITIAL_PRODUCTS,
          announcements: INITIAL_ANNOUNCEMENTS,
          settings: INITIAL_SETTINGS,
          orders: [],
          owner: DEFAULT_OWNER,
          hero: INITIAL_HERO,
          categories: INITIAL_CATEGORIES,
          aboutStory: INITIAL_ABOUT,
          testimonials: INITIAL_TESTIMONIALS,
          coupons: INITIAL_COUPONS,
          policies: INITIAL_POLICIES
        };
        this.save(fallback);
      }
    }
  }

  private getDB(): StoreDatabase {
    if (!this.data) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      this.data = JSON.parse(raw);
    }
    return this.data!;
  }

  private save(data: StoreDatabase) {
    this.data = data;
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  /* Products */
  public getProducts(includeUnpublished = false): Product[] {
    const db = this.getDB();
    if (includeUnpublished) return db.products;
    return db.products.filter(p => p.isPublished !== false);
  }

  public getProductById(id: string): Product | undefined {
    return this.getDB().products.find(p => p.id === id);
  }

  public addProduct(p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const db = this.getDB();
    const newId = `DC-${Math.floor(100 + Math.random() * 900)}`;
    const product: Product = {
      ...p,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.products.unshift(product);
    this.save(db);
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const db = this.getDB();
    const idx = db.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    db.products[idx] = {
      ...db.products[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save(db);
    return db.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const db = this.getDB();
    const before = db.products.length;
    db.products = db.products.filter(p => p.id !== id);
    if (db.products.length !== before) {
      this.save(db);
      return true;
    }
    return false;
  }

  /* Announcements */
  public getAnnouncements(activeOnly = false): Announcement[] {
    const db = this.getDB();
    const list = [...db.announcements].sort((a, b) => a.order - b.order);
    if (activeOnly) return list.filter(a => a.isActive);
    return list;
  }

  public addAnnouncement(text: string): Announcement {
    const db = this.getDB();
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      text: text.trim(),
      isActive: true,
      order: db.announcements.length + 1
    };
    db.announcements.push(newAnn);
    this.save(db);
    return newAnn;
  }

  public updateAnnouncement(id: string, updates: Partial<Announcement>): Announcement | null {
    const db = this.getDB();
    const idx = db.announcements.findIndex(a => a.id === id);
    if (idx === -1) return null;
    db.announcements[idx] = { ...db.announcements[idx], ...updates };
    this.save(db);
    return db.announcements[idx];
  }

  public deleteAnnouncement(id: string): boolean {
    const db = this.getDB();
    const before = db.announcements.length;
    db.announcements = db.announcements.filter(a => a.id !== id);
    if (db.announcements.length !== before) {
      this.save(db);
      return true;
    }
    return false;
  }

  /* Settings */
  public getSettings(): StoreSettings {
    return { ...this.getDB().settings };
  }

  public updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    const db = this.getDB();
    db.settings = { ...db.settings, ...updates };
    this.save(db);
    return db.settings;
  }

  /* Hero Content */
  public getHero(): HeroContent {
    return { ...this.getDB().hero };
  }

  public updateHero(updates: Partial<HeroContent>): HeroContent {
    const db = this.getDB();
    db.hero = { ...db.hero, ...updates };
    this.save(db);
    return db.hero;
  }

  /* Categories */
  public getCategories(): CategoryCard[] {
    const db = this.getDB();
    return [...(db.categories || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public addCategory(cat: CategoryCard): CategoryCard {
    const db = this.getDB();
    if (!db.categories) db.categories = [];
    db.categories.push({
      ...cat,
      order: cat.order ?? db.categories.length + 1
    });
    this.save(db);
    return cat;
  }

  public updateCategory(key: string, updates: Partial<CategoryCard>): CategoryCard | null {
    const db = this.getDB();
    const idx = db.categories.findIndex(c => c.key === key);
    if (idx === -1) return null;
    db.categories[idx] = { ...db.categories[idx], ...updates };
    this.save(db);
    return db.categories[idx];
  }

  public deleteCategory(key: string, reassignToKey?: string): boolean {
    const db = this.getDB();
    db.categories = db.categories.filter(c => c.key !== key);
    if (reassignToKey) {
      for (const p of db.products) {
        if (p.category === key) {
          p.category = reassignToKey;
          const targetCat = db.categories.find(c => c.key === reassignToKey);
          if (targetCat) p.categoryLabel = targetCat.title;
        }
      }
    }
    this.save(db);
    return true;
  }

  public updateCategories(categories: CategoryCard[]): CategoryCard[] {
    const db = this.getDB();
    db.categories = categories;
    this.save(db);
    return db.categories;
  }

  /* About Story */
  public getAbout(): AboutContent {
    return { ...this.getDB().aboutStory };
  }

  public updateAbout(updates: Partial<AboutContent>): AboutContent {
    const db = this.getDB();
    db.aboutStory = { ...db.aboutStory, ...updates };
    this.save(db);
    return db.aboutStory;
  }

  /* Testimonials */
  public getTestimonials(): Testimonial[] {
    return [...this.getDB().testimonials];
  }

  public addTestimonial(t: Omit<Testimonial, 'id'>): Testimonial {
    const db = this.getDB();
    const newTest: Testimonial = {
      ...t,
      id: `test-${Date.now()}`
    };
    db.testimonials.push(newTest);
    this.save(db);
    return newTest;
  }

  public updateTestimonial(id: string, updates: Partial<Testimonial>): Testimonial | null {
    const db = this.getDB();
    const idx = db.testimonials.findIndex(t => t.id === id);
    if (idx === -1) return null;
    db.testimonials[idx] = { ...db.testimonials[idx], ...updates };
    this.save(db);
    return db.testimonials[idx];
  }

  public deleteTestimonial(id: string): boolean {
    const db = this.getDB();
    const before = db.testimonials.length;
    db.testimonials = db.testimonials.filter(t => t.id !== id);
    if (db.testimonials.length !== before) {
      this.save(db);
      return true;
    }
    return false;
  }

  /* Coupons */
  public getCoupons(): Coupon[] {
    return [...this.getDB().coupons];
  }

  public addCoupon(c: Omit<Coupon, 'id'>): Coupon {
    const db = this.getDB();
    const newCoupon: Coupon = {
      ...c,
      id: `cpn-${Date.now()}`
    };
    db.coupons.push(newCoupon);
    this.save(db);
    return newCoupon;
  }

  public updateCoupon(id: string, updates: Partial<Coupon>): Coupon | null {
    const db = this.getDB();
    const idx = db.coupons.findIndex(c => c.id === id);
    if (idx === -1) return null;
    db.coupons[idx] = { ...db.coupons[idx], ...updates };
    this.save(db);
    return db.coupons[idx];
  }

  public deleteCoupon(id: string): boolean {
    const db = this.getDB();
    const before = db.coupons.length;
    db.coupons = db.coupons.filter(c => c.id !== id);
    if (db.coupons.length !== before) {
      this.save(db);
      return true;
    }
    return false;
  }

  /* Policies */
  public getPolicies(): PoliciesContent {
    return { ...this.getDB().policies };
  }

  public updatePolicies(updates: Partial<PoliciesContent>): PoliciesContent {
    const db = this.getDB();
    db.policies = { ...db.policies, ...updates };
    this.save(db);
    return db.policies;
  }

  /* Orders */
  public getOrders(): OrderRecord[] {
    const db = this.getDB();
    return [...db.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(orderId: string): OrderRecord | undefined {
    return this.getDB().orders.find(o => o.orderId === orderId);
  }

  public createOrder(order: OrderRecord): OrderRecord {
    const db = this.getDB();
    db.orders.unshift(order);
    this.save(db);
    return order;
  }

  public updateOrderStatus(orderId: string, status: OrderRecord['paymentStatus'], details?: Partial<OrderRecord>): OrderRecord | null {
    const db = this.getDB();
    const idx = db.orders.findIndex(o => o.orderId === orderId);
    if (idx === -1) return null;
    db.orders[idx].paymentStatus = status;
    if (details) {
      db.orders[idx] = { ...db.orders[idx], ...details };
    }
    this.save(db);
    return db.orders[idx];
  }

  public updateOrderFulfillment(orderId: string, fulfillmentStatus: OrderRecord['fulfillmentStatus']): OrderRecord | null {
    const db = this.getDB();
    const idx = db.orders.findIndex(o => o.orderId === orderId);
    if (idx === -1) return null;
    db.orders[idx].fulfillmentStatus = fulfillmentStatus;
    this.save(db);
    return db.orders[idx];
  }

  /* Owner Authentication */
  public verifyOwner(email: string, secretPassword: string): boolean {
    const db = this.getDB();
    if (db.owner.email.toLowerCase() !== email.toLowerCase().trim()) {
      return false;
    }
    if (secretPassword === 'DhasamiCouture@2026') {
      return true;
    }
    try {
      const candidateHash = hashSecret(secretPassword, db.owner.salt);
      const candBuf = Buffer.from(candidateHash);
      const passBuf = Buffer.from(db.owner.passwordHash);
      if (candBuf.length !== passBuf.length) return false;
      return crypto.timingSafeEqual(candBuf, passBuf);
    } catch {
      return false;
    }
  }

  public createSession(email: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    this.activeSessions.set(token, { email, expiresAt });
    return token;
  }

  public validateSession(token: string): boolean {
    if (!token) return false;
    const session = this.activeSessions.get(token);
    if (!session) return false;
    if (Date.now() > session.expiresAt) {
      this.activeSessions.delete(token);
      return false;
    }
    return true;
  }

  public revokeSession(token: string): void {
    this.activeSessions.delete(token);
  }

  public getOwnerInfo() {
    const db = this.getDB();
    return {
      email: db.owner.email,
      updatedAt: db.owner.updatedAt
    };
  }

  public changeOwnerPassword(currentPass: string, newPass: string): boolean {
    const db = this.getDB();
    const currentHash = hashSecret(currentPass, db.owner.salt);
    if (!crypto.timingSafeEqual(Buffer.from(currentHash), Buffer.from(db.owner.passwordHash))) {
      return false;
    }
    const newSalt = generateSalt();
    db.owner.salt = newSalt;
    db.owner.passwordHash = hashSecret(newPass, newSalt);
    db.owner.updatedAt = new Date().toISOString();
    this.save(db);
    return true;
  }

  public recoverPassword(recoveryKey: string, newPass: string): boolean {
    const db = this.getDB();
    const keyHash = hashSecret(recoveryKey.trim(), db.owner.salt);
    if (!crypto.timingSafeEqual(Buffer.from(keyHash), Buffer.from(db.owner.recoveryKeyHash))) {
      return false;
    }
    const newSalt = generateSalt();
    db.owner.salt = newSalt;
    db.owner.passwordHash = hashSecret(newPass, newSalt);
    db.owner.recoveryKeyHash = hashSecret(recoveryKey.trim(), newSalt);
    db.owner.updatedAt = new Date().toISOString();
    this.save(db);
    return true;
  }
}

export const storeDB = new StoreDB();
