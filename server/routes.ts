import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { storeDB, Product, OrderRecord, CategoryCard } from './db.ts';

export const apiRouter = Router();

// Middleware to protect owner-only operations
function requireOwnerAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : (req.headers['x-admin-token'] as string || '');

  if (!token || !storeDB.validateSession(token)) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Access restricted to authenticated boutique owner.'
    });
    return;
  }
  next();
}

/* ==========================================================================
   PUBLIC CATALOGUE & STORE ENDPOINTS
   ========================================================================== */

// Get products (Public sees only published, Owner with token can see all)
apiRouter.get('/products', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const isOwner = storeDB.validateSession(token);

  const products = storeDB.getProducts(isOwner);
  res.json({ products });
});

apiRouter.get('/products/:id', (req: Request, res: Response) => {
  const product = storeDB.getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ product });
});

// Get scrolling announcements (Public gets active ones)
apiRouter.get('/announcements', (_req: Request, res: Response) => {
  const announcements = storeDB.getAnnouncements(true);
  res.json({ announcements });
});

// Get categories (Public)
apiRouter.get('/categories', (_req: Request, res: Response) => {
  const categories = storeDB.getCategories();
  res.json({ categories });
});

// Get all dynamic site content for public display
apiRouter.get('/content', (_req: Request, res: Response) => {
  res.json({
    hero: storeDB.getHero(),
    categories: storeDB.getCategories(),
    aboutStory: storeDB.getAbout(),
    testimonials: storeDB.getTestimonials(),
    policies: storeDB.getPolicies(),
    activeCoupons: storeDB.getCoupons().filter(c => c.isActive).map(c => ({
      code: c.code,
      discountPercent: c.discountPercent,
      description: c.description
    }))
  });
});

// Get store settings (sensitive Razorpay Secret is NEVER sent to frontend)
apiRouter.get('/settings', (_req: Request, res: Response) => {
  const settings = storeDB.getSettings();
  res.json({
    settings: {
      whatsappNumber: settings.whatsappNumber,
      instagramHandle: settings.instagramHandle,
      instagramUrl: settings.instagramUrl,
      flagshipAddress: settings.flagshipAddress,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      shippingTamilNadu: settings.shippingTamilNadu,
      shippingPanIndia: settings.shippingPanIndia,
      gstRate: settings.gstRate,
      gstPricingMode: settings.gstPricingMode,
      currency: settings.currency,
      brandDisplayName: settings.brandDisplayName || 'Dhasami Couture',
      brandSubtitle: settings.brandSubtitle || 'HAUTE COUTURE · CHENNAI',
      razorpayKeyId: settings.razorpayKeyId || '',
      isRazorpayConfigured: Boolean(settings.razorpayKeyId && settings.razorpayKeySecret),
      gatewayMode: settings.gatewayMode
    }
  });
});

// Public order query for confirmation receipt
apiRouter.get('/orders/:orderId', (req: Request, res: Response) => {
  const order = storeDB.getOrderById(req.params.orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json({
    order: {
      orderId: order.orderId,
      date: order.date,
      items: order.items,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      gstAmount: order.gstAmount,
      shippingCharge: order.shippingCharge,
      grandTotal: order.grandTotal,
      customer: {
        fullName: order.customer.fullName,
        city: order.customer.city,
        state: order.customer.state,
        pincode: order.customer.pincode
      },
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      razorpayPaymentId: order.razorpayPaymentId
    }
  });
});

/* ==========================================================================
   CHECKOUT & PAYMENT PROCESSING (SERVER-AUTHORITATIVE)
   ========================================================================== */

interface CheckoutItemInput {
  productId: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface CustomerAddressInput {
  fullName: string;
  email?: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

// Helper: Calculate exact totals on server from persistent database & location rules
function calculateServerOrderTotals(
  items: CheckoutItemInput[],
  customer: CustomerAddressInput,
  couponCode?: string
): {
  subtotal: number;
  discountAmount: number;
  gstAmount: number;
  shippingCharge: number;
  grandTotal: number;
  orderItems: OrderRecord['items'];
} {
  const settings = storeDB.getSettings();
  let subtotal = 0;
  const orderItems: OrderRecord['items'] = [];

  for (const item of items) {
    const product = storeDB.getProductById(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} is not available.`);
    }
    const qty = Math.max(1, Math.floor(item.quantity));
    const totalItemPrice = product.price * qty;
    subtotal += totalItemPrice;

    orderItems.push({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: qty,
      selectedSize: item.selectedSize || product.sizes[0] || 'Standard',
      selectedColor: item.selectedColor || product.colors[0]?.name || 'Standard',
      totalItemPrice
    });
  }

  // Calculate discount server-side dynamically from database coupons
  let discountAmount = 0;
  if (couponCode) {
    const normalized = couponCode.trim().toUpperCase();
    const coupons = storeDB.getCoupons();
    const foundCoupon = coupons.find(c => c.isActive && c.code.trim().toUpperCase() === normalized);
    if (foundCoupon) {
      discountAmount = Math.round((subtotal * foundCoupon.discountPercent) / 100);
    }
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);

  // Requirement 3: Location-based Shipping (Tamil Nadu vs Pan-India)
  const stateStr = (customer?.state || '').trim().toLowerCase();
  const isTamilNadu = stateStr.includes('tamil nadu') || stateStr === 'tn';
  const shippingCharge = isTamilNadu ? (settings.shippingTamilNadu ?? 50) : (settings.shippingPanIndia ?? 100);

  // Requirement 4: Editable GST rate and Inclusive / Exclusive pricing mode
  const gstRate = typeof settings.gstRate === 'number' ? settings.gstRate : 12;
  const pricingMode = settings.gstPricingMode || 'inclusive';

  let gstAmount = 0;
  let grandTotal = 0;

  if (pricingMode === 'exclusive') {
    gstAmount = Math.round((taxableAmount * gstRate) / 100);
    grandTotal = taxableAmount + gstAmount + shippingCharge;
  } else {
    // inclusive: product prices already include GST
    gstAmount = Math.round(taxableAmount - (taxableAmount / (1 + gstRate / 100)));
    grandTotal = taxableAmount + shippingCharge;
  }

  return {
    subtotal,
    discountAmount,
    gstAmount,
    shippingCharge,
    grandTotal,
    orderItems
  };
}

// 1. Create Razorpay Payment Order
apiRouter.post('/checkout/create-payment-order', async (req: Request, res: Response) => {
  try {
    const { items, customer, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }
    if (!customer || !customer.fullName || !customer.phone || !customer.addressLine1 || !customer.state) {
      res.status(400).json({ error: 'Incomplete delivery address credentials (state is required for shipping).' });
      return;
    }

    const {
      subtotal,
      discountAmount,
      gstAmount,
      shippingCharge,
      grandTotal,
      orderItems
    } = calculateServerOrderTotals(items, customer, couponCode);

    const orderId = `DC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const settings = storeDB.getSettings();

    // Check if Razorpay keys are configured
    const keyId = settings.razorpayKeyId.trim();
    const keySecret = settings.razorpayKeySecret.trim();

    if (keyId && keySecret) {
      // Real Razorpay API Order Creation
      const amountPaise = Math.round(grandTotal * 100);
      const authBasic = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

      const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authBasic}`
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: 'INR',
          receipt: orderId,
          notes: {
            customerName: customer.fullName,
            customerPhone: customer.phone,
            deliveryState: customer.state,
            store: 'Dhasami Couture'
          }
        })
      });

      if (!rzpResponse.ok) {
        const errData = await rzpResponse.json().catch(() => ({}));
        console.error('Razorpay API error:', errData);
        res.status(502).json({
          error: 'Razorpay Gateway error',
          message: (errData as { error?: { description?: string } }).error?.description || 'Could not initiate Razorpay order. Please check keys in Admin settings.'
        });
        return;
      }

      const rzpData = (await rzpResponse.json()) as { id: string; amount: number; currency: string };

      // Record pending order in DB
      const newOrder: OrderRecord = {
        orderId,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: orderItems,
        subtotal,
        discountAmount,
        couponCode,
        gstAmount,
        shippingCharge,
        grandTotal,
        customer,
        paymentMethod: 'razorpay',
        paymentStatus: 'PENDING',
        fulfillmentStatus: 'Processing',
        razorpayOrderId: rzpData.id,
        createdAt: new Date().toISOString()
      };

      storeDB.createOrder(newOrder);

      res.json({
        success: true,
        orderId,
        razorpayOrderId: rzpData.id,
        amountPaise: rzpData.amount,
        currency: rzpData.currency,
        keyId,
        grandTotal,
        shippingCharge,
        gstAmount,
        gatewayReady: true
      });
      return;
    } else {
      // Razorpay keys pending configuration by boutique owner
      const newOrder: OrderRecord = {
        orderId,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: orderItems,
        subtotal,
        discountAmount,
        couponCode,
        gstAmount,
        shippingCharge,
        grandTotal,
        customer,
        paymentMethod: 'razorpay',
        paymentStatus: 'PENDING',
        fulfillmentStatus: 'Processing',
        createdAt: new Date().toISOString()
      };

      storeDB.createOrder(newOrder);

      res.json({
        success: true,
        orderId,
        grandTotal,
        shippingCharge,
        gstAmount,
        gatewayReady: false,
        message: 'Razorpay Key ID and Secret are not yet configured in Owner Admin. Please enter your Razorpay keys in the Owner Dashboard.'
      });
      return;
    }
  } catch (err: unknown) {
    console.error('Checkout order creation failed:', err);
    res.status(500).json({
      error: 'Order creation failed',
      message: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// 2. Verify Razorpay Payment Signature (HMAC SHA-256)
apiRouter.post('/checkout/verify-payment', (req: Request, res: Response) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400).json({ error: 'Missing payment signature verification arguments' });
      return;
    }

    const order = storeDB.getOrderById(orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.paymentStatus === 'PAID') {
      res.json({ verified: true, message: 'Order was already verified and paid.', order });
      return;
    }

    const settings = storeDB.getSettings();
    const keySecret = settings.razorpayKeySecret.trim();

    if (!keySecret) {
      res.status(400).json({ error: 'Payment secret not configured on server' });
      return;
    }

    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    const isMatch = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpaySignature)
    );

    if (!isMatch) {
      storeDB.updateOrderStatus(orderId, 'FAILED', {
        razorpayOrderId,
        razorpayPaymentId
      });
      res.status(400).json({ verified: false, error: 'Cryptographic signature mismatch. Payment verification failed.' });
      return;
    }

    // Mark as PAID and decrement stock (including variant stock if mapped)
    const updatedOrder = storeDB.updateOrderStatus(orderId, 'PAID', {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paidAt: new Date().toISOString()
    });

    for (const item of order.items) {
      const prod = storeDB.getProductById(item.productId);
      if (prod) {
        const newTotalStock = Math.max(0, prod.stock - item.quantity);
        let updatedVariantStock = prod.variantStock ? { ...prod.variantStock } : undefined;
        if (updatedVariantStock) {
          const variantKey = `${item.selectedColor}_${item.selectedSize}`;
          if (updatedVariantStock[variantKey] !== undefined) {
            updatedVariantStock[variantKey] = Math.max(0, updatedVariantStock[variantKey] - item.quantity);
          }
        }
        storeDB.updateProduct(prod.id, {
          stock: newTotalStock,
          variantStock: updatedVariantStock
        });
      }
    }

    res.json({
      verified: true,
      message: 'Payment verified successfully by backend.',
      order: updatedOrder
    });
  } catch (err: unknown) {
    console.error('Payment verification error:', err);
    res.status(500).json({
      error: 'Payment verification failed',
      message: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Requirement 5: Cash on Delivery is discontinued
apiRouter.post('/checkout/place-cod-order', (_req: Request, res: Response) => {
  res.status(403).json({
    error: 'Cash on Delivery Disabled',
    message: 'Dhasami Couture exclusively accepts online prepayment via Razorpay to guarantee artisan orders.'
  });
});

/* ==========================================================================
   OWNER AUTHENTICATION (SECURE SESSION MANAGEMENT)
   ========================================================================== */

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const isValid = storeDB.verifyOwner(email, password);
  if (!isValid) {
    res.status(401).json({ error: 'Invalid credentials. Access denied.' });
    return;
  }

  const token = storeDB.createSession(email);
  res.json({
    success: true,
    token,
    owner: { email }
  });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (token) storeDB.revokeSession(token);
  res.json({ success: true });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const isValid = storeDB.validateSession(token);
  if (!isValid) {
    res.json({ authenticated: false });
    return;
  }
  const info = storeDB.getOwnerInfo();
  res.json({ authenticated: true, owner: info });
});

apiRouter.post('/auth/change-password', requireOwnerAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    return;
  }
  const changed = storeDB.changeOwnerPassword(currentPassword, newPassword);
  if (!changed) {
    res.status(400).json({ error: 'Current password incorrect.' });
    return;
  }
  res.json({ success: true, message: 'Owner password updated securely.' });
});

apiRouter.post('/auth/recover-password', (req: Request, res: Response) => {
  const { recoveryKey, newPassword } = req.body;
  if (!recoveryKey || !newPassword || newPassword.length < 8) {
    res.status(400).json({ error: 'Valid recovery key and strong password (min 8 chars) required.' });
    return;
  }
  const recovered = storeDB.recoverPassword(recoveryKey, newPassword);
  if (!recovered) {
    res.status(401).json({ error: 'Invalid emergency recovery key.' });
    return;
  }
  res.json({ success: true, message: 'Password reset successfully with recovery key.' });
});

/* ==========================================================================
   OWNER ADMIN OPERATIONS (AUTHENTICATION ENFORCED)
   ========================================================================== */

// 1. Add Product (with colors, color-specific images, sizes, variant stock)
apiRouter.post('/admin/products', requireOwnerAuth, (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      categoryLabel,
      price,
      originalPrice,
      rating,
      reviewsCount,
      isBestseller,
      isNew,
      isPublished,
      stock,
      colors,
      sizes,
      variantStock,
      fabric,
      craft,
      leadTime,
      description,
      image,
      additionalImages
    } = req.body;

    if (!name || !price || !category) {
      res.status(400).json({ error: 'Name, price, and category are required.' });
      return;
    }

    const product = storeDB.addProduct({
      name: name.trim(),
      category: category.trim(),
      categoryLabel: categoryLabel || 'Atelier Festive Silhouette',
      price: Number(price),
      originalPrice: Number(originalPrice || price),
      rating: Number(rating || 5.0),
      reviewsCount: Number(reviewsCount || 1),
      isBestseller: Boolean(isBestseller),
      isNew: Boolean(isNew !== undefined ? isNew : true),
      isPublished: Boolean(isPublished !== undefined ? isPublished : true),
      stock: Number(stock || 5),
      colors: Array.isArray(colors) && colors.length > 0 ? colors : [{ name: 'Heritage Crimson', hex: '#8B1E3F', images: [image] }],
      sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
      variantStock: variantStock || {},
      fabric: fabric || 'Pure Handcrafted Silk & Cotton Blend',
      craft: craft || 'Traditional Artisanal Needlework',
      leadTime: leadTime || 'Ready to dispatch within 24 hours',
      description: description || 'Artisan woven luxury ensemble.',
      image: image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
      additionalImages: Array.isArray(additionalImages) && additionalImages.length > 0 ? additionalImages : [image]
    });

    res.json({ success: true, product });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to add product', message: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// 2. Update Product
apiRouter.put('/admin/products/:id', requireOwnerAuth, (req: Request, res: Response) => {
  const updated = storeDB.updateProduct(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ success: true, product: updated });
});

// 3. Delete Product
apiRouter.delete('/admin/products/:id', requireOwnerAuth, (req: Request, res: Response) => {
  const deleted = storeDB.deleteProduct(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ success: true });
});

// 4. Secure Image Upload
apiRouter.post('/admin/upload-image', requireOwnerAuth, (req: Request, res: Response) => {
  try {
    const { base64Data } = req.body;
    if (!base64Data) {
      res.status(400).json({ error: 'base64Data is required' });
      return;
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ error: 'Invalid base64 image data' });
      return;
    }

    const ext = matches[1].includes('png') ? 'png' : matches[1].includes('webp') ? 'webp' : 'jpg';
    const cleanFilename = `couture-${Date.now()}-${Math.floor(100 + Math.random() * 900)}.${ext}`;
    const uploadsDir = path.resolve(process.cwd(), 'data', 'uploads');
    const targetPath = path.join(uploadsDir, cleanFilename);

    fs.writeFileSync(targetPath, Buffer.from(matches[2], 'base64'));

    const publicUrl = `/uploads/${cleanFilename}`;
    res.json({ success: true, url: publicUrl });
  } catch (err: unknown) {
    console.error('Image upload failed:', err);
    res.status(500).json({ error: 'Upload failed', message: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// 5. Dynamic Category Management (Requirement 8)
apiRouter.get('/admin/categories', requireOwnerAuth, (_req: Request, res: Response) => {
  res.json({ categories: storeDB.getCategories() });
});

apiRouter.post('/admin/categories', requireOwnerAuth, (req: Request, res: Response) => {
  try {
    const { key, title, subtitle, description, img, subcategories, order } = req.body;
    if (!key || !title) {
      res.status(400).json({ error: 'Category key/identifier and title are required.' });
      return;
    }

    const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const existing = storeDB.getCategories().find(c => c.key === cleanKey);
    if (existing) {
      res.status(400).json({ error: 'Category with this identifier already exists.' });
      return;
    }

    const newCategory: CategoryCard = {
      key: cleanKey,
      title: title.trim(),
      subtitle: subtitle?.trim() || '',
      description: description?.trim() || '',
      img: img || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
      subcategories: Array.isArray(subcategories) ? subcategories : [],
      order: Number(order || storeDB.getCategories().length + 1)
    };

    storeDB.addCategory(newCategory);
    res.json({ success: true, category: newCategory, categories: storeDB.getCategories() });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to create category', message: err instanceof Error ? err.message : 'Unknown error' });
  }
});

apiRouter.put('/admin/categories/:key', requireOwnerAuth, (req: Request, res: Response) => {
  const updated = storeDB.updateCategory(req.params.key, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Category not found.' });
    return;
  }
  res.json({ success: true, category: updated, categories: storeDB.getCategories() });
});

apiRouter.delete('/admin/categories/:key', requireOwnerAuth, (req: Request, res: Response) => {
  const { reassignToKey } = req.body;
  const key = req.params.key;

  const productsInCat = storeDB.getProducts(true).filter(p => p.category === key);
  if (productsInCat.length > 0 && !reassignToKey) {
    res.status(400).json({
      error: 'Cannot delete category with products without reassignment.',
      productsCount: productsInCat.length,
      requiresReassignment: true
    });
    return;
  }

  const deleted = storeDB.deleteCategory(key, reassignToKey);
  res.json({ success: deleted, categories: storeDB.getCategories() });
});

apiRouter.put('/admin/categories/reorder', requireOwnerAuth, (req: Request, res: Response) => {
  const { categories } = req.body;
  if (!Array.isArray(categories)) {
    res.status(400).json({ error: 'Array of categories required.' });
    return;
  }
  const updated = storeDB.updateCategories(categories);
  res.json({ success: true, categories: updated });
});

// 6. Announcements Management
apiRouter.get('/admin/announcements', requireOwnerAuth, (_req: Request, res: Response) => {
  const announcements = storeDB.getAnnouncements(false);
  res.json({ announcements });
});

apiRouter.post('/admin/announcements', requireOwnerAuth, (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    res.status(400).json({ error: 'Announcement text is required' });
    return;
  }
  const announcement = storeDB.addAnnouncement(text);
  res.json({ success: true, announcement });
});

apiRouter.put('/admin/announcements/:id', requireOwnerAuth, (req: Request, res: Response) => {
  const updated = storeDB.updateAnnouncement(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Announcement not found' });
    return;
  }
  res.json({ success: true, announcement: updated });
});

apiRouter.delete('/admin/announcements/:id', requireOwnerAuth, (req: Request, res: Response) => {
  const deleted = storeDB.deleteAnnouncement(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Announcement not found' });
    return;
  }
  res.json({ success: true });
});

// 7. Orders Management
apiRouter.get('/admin/orders', requireOwnerAuth, (_req: Request, res: Response) => {
  const orders = storeDB.getOrders();
  res.json({ orders });
});

apiRouter.put('/admin/orders/:orderId/fulfillment', requireOwnerAuth, (req: Request, res: Response) => {
  const { fulfillmentStatus } = req.body;
  if (!fulfillmentStatus) {
    res.status(400).json({ error: 'fulfillmentStatus required' });
    return;
  }
  const updated = storeDB.updateOrderFulfillment(req.params.orderId, fulfillmentStatus);
  if (!updated) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json({ success: true, order: updated });
});

// 8. Store Settings Management (Shipping, GST, Social, Gateway)
apiRouter.get('/admin/settings', requireOwnerAuth, (_req: Request, res: Response) => {
  const settings = storeDB.getSettings();
  res.json({
    settings: {
      ...settings,
      razorpayKeySecretMasked: settings.razorpayKeySecret
        ? `••••••••${settings.razorpayKeySecret.slice(-4)}`
        : ''
    }
  });
});

apiRouter.put('/admin/settings', requireOwnerAuth, (req: Request, res: Response) => {
  const updates = { ...req.body };
  if (updates.razorpayKeySecret && updates.razorpayKeySecret.includes('••••')) {
    delete updates.razorpayKeySecret;
  }
  const updated = storeDB.updateSettings(updates);
  res.json({ success: true, settings: updated });
});

// 9. Full Site Content Customization
apiRouter.put('/admin/content/hero', requireOwnerAuth, (req: Request, res: Response) => {
  const hero = storeDB.updateHero(req.body);
  res.json({ success: true, hero });
});

apiRouter.put('/admin/content/about', requireOwnerAuth, (req: Request, res: Response) => {
  const about = storeDB.updateAbout(req.body);
  res.json({ success: true, about });
});

apiRouter.get('/admin/testimonials', requireOwnerAuth, (_req: Request, res: Response) => {
  res.json({ testimonials: storeDB.getTestimonials() });
});

apiRouter.post('/admin/testimonials', requireOwnerAuth, (req: Request, res: Response) => {
  const { quote, author, city, rating } = req.body;
  if (!quote || !author) {
    res.status(400).json({ error: 'Quote and author required' });
    return;
  }
  const t = storeDB.addTestimonial({
    quote: quote.trim(),
    author: author.trim(),
    city: (city || 'India').trim(),
    rating: Number(rating || 5)
  });
  res.json({ success: true, testimonial: t });
});

apiRouter.put('/admin/testimonials/:id', requireOwnerAuth, (req: Request, res: Response) => {
  const updated = storeDB.updateTestimonial(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Testimonial not found' });
    return;
  }
  res.json({ success: true, testimonial: updated });
});

apiRouter.delete('/admin/testimonials/:id', requireOwnerAuth, (req: Request, res: Response) => {
  const deleted = storeDB.deleteTestimonial(req.params.id);
  res.json({ success: deleted });
});

apiRouter.get('/admin/coupons', requireOwnerAuth, (_req: Request, res: Response) => {
  res.json({ coupons: storeDB.getCoupons() });
});

apiRouter.post('/admin/coupons', requireOwnerAuth, (req: Request, res: Response) => {
  const { code, discountPercent, description } = req.body;
  if (!code || !discountPercent) {
    res.status(400).json({ error: 'Code and discount percentage required' });
    return;
  }
  const c = storeDB.addCoupon({
    code: code.trim().toUpperCase(),
    discountPercent: Number(discountPercent),
    description: (description || '').trim(),
    isActive: true
  });
  res.json({ success: true, coupon: c });
});

apiRouter.put('/admin/coupons/:id', requireOwnerAuth, (req: Request, res: Response) => {
  const updated = storeDB.updateCoupon(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Coupon not found' });
    return;
  }
  res.json({ success: true, coupon: updated });
});

apiRouter.delete('/admin/coupons/:id', requireOwnerAuth, (req: Request, res: Response) => {
  const deleted = storeDB.deleteCoupon(req.params.id);
  res.json({ success: deleted });
});

apiRouter.put('/admin/content/policies', requireOwnerAuth, (req: Request, res: Response) => {
  const policies = storeDB.updatePolicies(req.body);
  res.json({ success: true, policies });
});
