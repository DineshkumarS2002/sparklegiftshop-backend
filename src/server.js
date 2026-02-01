require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const connectDB = require('./db');

// Models
const Product = require('./models/Product');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const Settings = require('./models/Settings');
const Coupon = require('./models/Coupon');

const PORT = process.env.PORT || 4000;
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '1234567890';

const app = express();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"]
  }
});

// Attach io to app to use in routes
app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Socket ${socket.id} joined room: order_${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check
app.get('/', (req, res) => res.send('Sparkle Gift Shop API is running...'));

// Connect to MongoDB
connectDB();

const seedProducts = [
  {
    id: 'pf-001',
    name: 'Classic Photo Frame',
    price: 299,
    category: 'Photo Frames',
    image: 'https://images.unsplash.com/photo-1523419400524-1d25ae3ca7c0?auto=format&fit=crop&w=600&q=80',
    description: 'Elegant wooden photo frame for 5x7 photos.',
  },
  {
    id: 'cm-001',
    name: 'Custom Coffee Mug',
    price: 249,
    category: 'Coffee Mugs',
    image: 'https://images.unsplash.com/photo-1462917882517-e150004895fa?auto=format&fit=crop&w=600&q=80',
    description: 'Ceramic mug with your photo printed.',
  },
  {
    id: 'cm-002',
    name: 'Hidden Photo Mug',
    price: 399,
    category: 'Coffee Mugs',
    image: 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?auto=format&fit=crop&w=600&q=80',
    description: 'Heat reveal mug showing a hidden photo.',
  },
  {
    id: 'll-001',
    name: 'Custom Light Lamp',
    price: 899,
    category: 'Lamps',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80',
    description: 'Personalized night lamp with etched image.',
  },
  {
    id: 'hp-001',
    name: 'Heart Pillow',
    price: 599,
    category: 'Pillows',
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=600&q=80',
    description: 'Soft heart pillow printed with your photo.',
  },
  {
    id: 'pl-001',
    name: 'Photo Lamp Cube',
    price: 1199,
    category: 'Lamps',
    image: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=600&q=80',
    description: 'Cube lamp that showcases multiple photos.',
  },
  {
    id: 'pf-002',
    name: 'Collage Photo Frame (8 Photos)',
    price: 749,
    category: 'Photo Frames',
    image: 'https://images.unsplash.com/photo-1452800185063-6db5e12b8e2e?auto=format&fit=crop&w=600&q=80',
    description: 'Wall collage frame for 8 small photos.',
  },
  {
    id: 'mg-001',
    name: 'Magic Mirror Photo Frame',
    price: 1399,
    category: 'Photo Frames',
    image: 'https://images.unsplash.com/photo-1519710887729-8e3f2c0f742c?auto=format&fit=crop&w=600&q=80',
    description: 'LED magic mirror frame with custom photo.',
  },
  {
    id: 'cm-003',
    name: 'Couple Name Mug Set (2)',
    price: 499,
    category: 'Coffee Mugs',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    description: 'Two mugs printed with names & date.',
  },
  {
    id: 'ks-001',
    name: 'Photo Keychain (Acrylic)',
    price: 149,
    category: 'Keychains',
    image: 'https://images.unsplash.com/photo-1591035897819-f4bdf739f446?auto=format&fit=crop&w=600&q=80',
    description: 'Pocket-size acrylic photo keychain.',
  },
  {
    id: 'pl-002',
    name: '3D Photo Lamp (Moon)',
    price: 1299,
    category: 'Lamps',
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=600&q=80',
    description: '3D moon lamp with custom name/photo stand.',
  },
  {
    id: 'ph-001',
    name: 'Heart Photo Pillow (Premium)',
    price: 799,
    category: 'Pillows',
    image: 'https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=600&q=80',
    description: 'Premium fabric heart pillow with HD print.',
  },
  {
    id: 'cb-001',
    name: 'Customized Chocolate Box',
    price: 699,
    category: 'Gift Boxes',
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=600&q=80',
    description: 'Gift box with name label and chocolates.',
  },
  {
    id: 'bd-001',
    name: 'Birthday Photo Banner',
    price: 349,
    category: 'Decor',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80',
    description: 'Custom birthday banner with photos.',
  },
];

async function ensureSeed() {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(seedProducts);
    console.log('Seeded products');
  }

  // Ensure initial settings
  const settingsCount = await Settings.countDocuments();
  if (settingsCount === 0) {
    const defaultSettings = {
      upiQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=Gift%20Shop%20Payment',
      whatsappNumber: WHATSAPP_NUMBER,
      lastInvoiceNumber: 0,
      reportUrl: 'https://docs.google.com/spreadsheets/d/1LYhiIzuFm1FHrxEVl1aHczda5XyQABozK8rpfGFc6XE/edit?gid=0#gid=0'
    };
    await Settings.create(defaultSettings);
    console.log('Seeded settings');
  }

  // Migration: Update old UUID-style IDs to the new format for consistency
  const allProducts = await Product.find({ id: /^p-/ });
  for (const p of allProducts) {
    const cleanName = p.name.trim().split(' ')[0].replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5);
    const existingProductsWithPrefix = await Product.find({ id: new RegExp(`^${cleanName}`) });
    const nextNum = existingProductsWithPrefix.length + 1;
    const newId = `${cleanName}-${String(nextNum).padStart(3, '0')}`;

    const oldId = p.id;
    console.log(`Migrating ID: ${oldId} -> ${newId}`);

    // Update the product itself
    await Product.updateOne({ _id: p._id }, { $set: { id: newId } });

    // Update references in Orders (Array update)
    await Order.updateMany(
      { "items.productId": oldId },
      { $set: { "items.$[elem].productId": newId } },
      { arrayFilters: [{ "elem.productId": oldId }] }
    );

    // Update references in Carts (Array update)
    await Cart.updateMany(
      { "items.productId": oldId },
      { $set: { "items.$[elem].productId": newId } },
      { arrayFilters: [{ "elem.productId": oldId }] }
    );
  }

}

async function getCart() {
  // Singleton cart logic
  let cart = await Cart.findOne();
  if (!cart) {
    cart = await Cart.create({ items: [] });
  }
  return cart;
}

// Helpers
async function nextInvoice() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  // Find orders created today to check max sequence
  const startOfDay = new Date(dateStr);
  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);

  const maxOrder = await Order.findOne({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  }).sort({ invoiceSequence: -1 });

  const maxSeq = maxOrder ? (maxOrder.invoiceSequence || 0) : 0;
  const nextSeq = maxSeq + 1;

  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = String(now.getFullYear()).slice(-2);
  const formattedDate = `${d}${m}${y}`;

  return {
    invoiceNumber: nextSeq,
    invoiceSequence: nextSeq,
    invoiceId: `${formattedDate}-${String(nextSeq).padStart(3, '0')}`,
  };
}

function withProductDetails(cartItems, products) {
  const map = new Map(products.map((p) => [p.id, p]));
  const items = cartItems
    .map((item) => {
      // If product details are embedded (like in order items), use them.
      // Otherwise, look up from master list.
      const product = item.product || map.get(item.productId);
      if (!product) return null;
      const price = item.variantPrice || product.price;
      const lineTotal = +(price * item.quantity).toFixed(2);
      // Ensure we return a plain object structure
      return {
        productId: item.productId,
        quantity: item.quantity,
        variantSize: item.variantSize,
        variantPrice: item.variantPrice,
        product,
        lineTotal
      };
    })
    .filter(Boolean);
  const subtotal = +items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2);
  return { items, subtotal, total: subtotal };
}

function summarizeOrders(orders, range = 'daily') {
  const groups = new Map();
  orders.forEach((order) => {
    // Filter: Only count COD or Paid/Screenshot UPI orders in reports
    const isActive = order.paymentMethod === 'cod' || order.isPaid || !!order.paymentScreenshot;
    if (!isActive) return;

    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const key =
      range === 'yearly'
        ? `${date.getFullYear()}`
        : range === 'monthly'
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
            date.getDate(),
          ).padStart(2, '0')}`;
    const current = groups.get(key) || { total: 0, orders: 0 };
    current.total += order.total || 0;
    current.orders += 1;
    groups.set(key, current);
  });
  return Array.from(groups.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([label, value]) => ({ label, ...value, total: +value.total.toFixed(2) }));
}


function cartSummaryText(items, total) {
  const lines = items.map(
    (item) => `*${item.quantity} x ${item.product.name}* = ₹${item.lineTotal}`,
  );
  lines.push(`*Total: ₹${total}*`);
  return encodeURIComponent(lines.join('\n'));
}

function summarizeProductSales(orders) {
  const productStats = new Map();

  orders.forEach(order => {
    // Filter: Only count COD or Paid/Screenshot UPI orders in stats
    const isActive = order.paymentMethod === 'cod' || order.isPaid || !!order.paymentScreenshot;
    if (!isActive) return;

    if (!order.items) return;
    order.items.forEach(item => {
      const pName = item.product?.name || `Product ${item.productId}`;
      const existing = productStats.get(pName) || { quantity: 0, revenue: 0 };
      existing.quantity += item.quantity || 0;
      existing.revenue += item.lineTotal || 0;
      productStats.set(pName, existing);
    });
  });

  return Array.from(productStats.entries())
    .map(([name, stats]) => ({
      name,
      quantity: stats.quantity,
      revenue: +stats.revenue.toFixed(2)
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

// Routes
app.get("/", (req, res) => {
  res.send("Backend running successfully");
});

app.get("/data", (req, res) => {
  res.json({ message: "Data route working" });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Products CRUD
app.get('/api/products', async (_req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, price, category, image, description, variants } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: 'name and price are required' });
    }
    const cleanName = name.trim().split(' ')[0].replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5);
    const existingCount = await Product.countDocuments({
      id: { $regex: new RegExp(`^${cleanName}`) }
    });
    const itemCode = `${cleanName}-${String(existingCount + 1).padStart(3, '0')}`;


    const newProduct = new Product({
      id: itemCode,
      name,
      price: Number(price),
      category: category || 'General',
      image: image || '',
      description: description || '',
      variants: variants || []
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    Object.assign(product, req.body);
    if (req.body.price) product.price = Number(req.body.price);

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const result = await Product.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Product not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cart operations
// Cart operations
async function getProductsForCart(cartItems) {
  if (!cartItems || cartItems.length === 0) return { items: [], subtotal: 0, total: 0 };

  const productIds = cartItems.map(i => i.productId);
  const products = await Product.find({ id: { $in: productIds } }).lean();
  const productMap = new Map(products.map(p => [p.id, p]));

  const items = cartItems.map(item => {
    const product = item.product || productMap.get(item.productId);
    if (!product) return null;
    const price = item.variantPrice || product.price;
    const lineTotal = +(price * item.quantity).toFixed(2);
    return {
      productId: item.productId,
      quantity: item.quantity,
      variantSize: item.variantSize,
      variantPrice: item.variantPrice,
      product,
      lineTotal
    };
  }).filter(Boolean);

  const subtotal = +items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2);
  return { items, subtotal, total: subtotal };
}

app.get('/api/cart', async (_req, res) => {
  try {
    const cart = await getCart();
    const result = await getProductsForCart(cart.items);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/cart/add', async (req, res) => {
  try {
    const { productId, quantity = 1, variant } = req.body;
    const product = await Product.findOne({ id: productId }).select('id price name').lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const cart = await getCart();
    // Check if item with same product AND same variant exists
    const variantSize = variant ? variant.size : null;

    const existing = cart.items.find((item) =>
      item.productId === productId && item.variantSize === variantSize
    );

    if (existing) {
      existing.quantity += Number(quantity) || 1;
    } else {
      cart.items.push({
        productId,
        quantity: Number(quantity) || 1,
        variantSize: variantSize,
        variantPrice: variant ? variant.price : undefined,
        variantOriginalPrice: variant ? variant.originalPrice : undefined
      });
    }

    await cart.save();

    const result = await getProductsForCart(cart.items);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/cart/item/:productId', async (req, res) => {
  try {
    const quantity = Number(req.body.quantity);
    const { productId } = req.params;
    const { variantSize } = req.body; // Optional: to identify specific variant item
    const cart = await getCart();

    // Find item by productId AND variantSize (if provided, else first match or error?)
    // Simpler approach: find item that matches. 
    // Limitation here: if multiple variants of same product exist, we need variantSize to identify which to update.
    // For now, let's assume UI passes the correct variantSize/Id logic or we just find matching.

    const item = cart.items.find((i) => i.productId === productId && i.variantSize === variantSize);

    if (!item) return res.status(404).json({ message: 'Cart item not found' });

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => !(i.productId === productId && i.variantSize === variantSize));
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    const result = await getProductsForCart(cart.items);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/cart/clear', async (_req, res) => {
  try {
    const cart = await getCart();
    cart.items = [];
    await cart.save();
    res.json({ items: [], subtotal: 0, total: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Orders
app.get('/api/orders', async (req, res) => {
  try {
    const { phone } = req.query;
    let query = {};
    if (phone) {
      query = { phone: { $regex: phone, $options: 'i' } };
    }
    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(500).lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ id: req.params.id }, { invoiceId: req.params.id }]
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/orders/:id/screenshot', async (req, res) => {
  try {
    const { screenshot } = req.body;
    const order = await Order.findOne({
      $or: [{ id: req.params.id }, { invoiceId: req.params.id }]
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.paymentScreenshot = screenshot;
    await order.save();
    res.json({ success: true, message: 'Screenshot uploaded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const result = await Order.deleteOne({
      $or: [{ id: req.params.id }, { invoiceId: req.params.id }]
    });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Order not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/orders/:id/dispatch', async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.dispatched = req.body.dispatched !== undefined ? req.body.dispatched : !order.dispatched;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/orders/:id/payment', async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.isPaid = req.body.isPaid !== undefined ? req.body.isPaid : !order.isPaid;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/orders/:id/tracking', async (req, res) => {
  try {
    const { courierPartner, trackingId, message, location } = req.body;
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (courierPartner !== undefined) order.courierPartner = courierPartner;
    if (trackingId !== undefined) order.trackingId = trackingId;

    if (message || location) {
      order.trackingEvents.push({
        message: message || 'Status updated',
        location: location || '',
        updatedAt: new Date()
      });
    }

    await order.save();

    // Real-time update via socket
    const io = req.app.get('io');
    io.to(`order_${order.id}`).emit('tracking_update', order);

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { items: bodyItems, customerName, phone, address, paymentMethod, couponCode, note } =
      req.body || {};

    const products = await Product.find();
    const cart = await getCart();
    const coupons = await Coupon.find();

    const sourceItems = Array.isArray(bodyItems) && bodyItems.length ? bodyItems : cart.items;
    if (!sourceItems || sourceItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const detailed = withProductDetails(sourceItems, products);
    const subtotal = detailed.subtotal;

    // Logic for discount
    let discount = 0;
    if (couponCode) {
      const cp = coupons.find(c => c.code === couponCode.toUpperCase());
      if (cp) {
        if (cp.applicableTo === 'all') {
          discount = cp.type === 'percent' ? subtotal * (cp.value / 100) : cp.value;
        } else {
          const validIds = cp.productIds || [];
          const matchingItems = detailed.items.filter(i => validIds.includes(i.productId));
          if (matchingItems.length > 0) {
            if (cp.type === 'percent') {
              const matchTotal = matchingItems.reduce((acc, i) => acc + i.lineTotal, 0);
              discount = matchTotal * (cp.value / 100);
            } else {
              discount = cp.value;
            }
          }
        }
      }
    }

    // Final subtotal after discount
    const discountedSubtotal = Math.max(0, subtotal - discount);

    // Delivery fee logic: (Testing: set to 0)
    const deliveryFee = 0; // subtotal < 500 ? 50 : 0;
    const finalTotal = discountedSubtotal + deliveryFee;

    const invoice = await nextInvoice();
    const orderData = {
      id: `o-${uuidv4()}`,
      invoiceNumber: invoice.invoiceNumber,
      invoiceSequence: invoice.invoiceSequence,
      invoiceId: invoice.invoiceId,
      createdAt: new Date(),
      items: detailed.items,
      subtotal: subtotal,
      discount: +discount.toFixed(2),
      deliveryFee: deliveryFee,
      total: +finalTotal.toFixed(2),
      customerName: customerName || 'Walk-in',
      phone: phone || '',
      address: address || '',
      paymentMethod: paymentMethod || 'unknown',
      dispatched: false,
      note: note || '',
    };

    const order = await Order.create(orderData);

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reports
app.get('/api/reports/summary', async (req, res) => {
  const range = req.query.range || 'daily';
  const orders = await Order.find();
  res.json(summarizeOrders(orders, range));
});

app.get('/api/reports/export', async (req, res) => {
  const range = req.query.range || 'daily';
  const format = (req.query.format || '').toLowerCase();

  // Filter: Only count COD or Paid/Screenshot UPI orders
  const orders = (await Order.find()).filter(o => {
    return o.paymentMethod === 'cod' || o.isPaid || !!o.paymentScreenshot;
  });

  const productSales = summarizeProductSales(orders);
  const totalProductRevenue = productSales.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalDeliveryFees = orders.reduce((acc, o) => acc + (o.deliveryFee || 0), 0);
  const totalDiscounts = orders.reduce((acc, o) => acc + (o.discount || 0), 0);
  const netCollection = orders.reduce((acc, o) => acc + (o.total || 0), 0);

  // PDF export
  if (format === 'pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="sales-report.pdf"');

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    // Header
    doc.fontSize(22).font('Helvetica-Bold').text('Sparkle Gift Shop', { align: 'center' });
    doc.fontSize(14).text('Sales & Collection Report', { align: 'center' });
    doc.moveDown(0.5);

    // Manual IST Calculation (GMT+5:30)
    const now = new Date();
    const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const timeStr = `${ist.getUTCDate()}/${ist.getUTCMonth() + 1}/${ist.getUTCFullYear()}, ${ist.getUTCHours() % 12 || 12}:${String(ist.getUTCMinutes()).padStart(2, '0')}:${String(ist.getUTCSeconds()).padStart(2, '0')} ${ist.getUTCHours() >= 12 ? 'PM' : 'AM'}`;

    doc.fontSize(10).fillColor('#64748b').text(`Generated on: ${timeStr} IST`, { align: 'center' });
    doc.fillColor('#0f172a');
    doc.moveDown(1.5);

    // Table Header
    const startX = 40;
    const col1 = startX;       // Product Name
    const col2 = startX + 280; // Quantity
    const col3 = startX + 400; // Revenue

    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('Product Name', col1, doc.y);
    doc.text('Sold Qty', col2, doc.y);
    doc.text('Amount (Rs.)', col3, doc.y);
    doc.moveDown(0.5);
    doc.moveTo(startX, doc.y).lineTo(550, doc.y).strokeColor('#e2e8f0').stroke();
    doc.moveDown(0.5);

    // Table Rows
    doc.font('Helvetica').fontSize(10);
    let y = doc.y;

    productSales.forEach((row, i) => {
      if (i % 2 === 0) {
        doc.save().fillColor('#f8fafc').rect(startX, y - 2, 510, 18).fill().restore();
      }

      doc.fillColor('#0f172a');
      doc.text(row.name, col1, y, { width: 270, ellipsis: true });
      doc.text(String(row.quantity), col2, y);
      doc.text(row.revenue.toFixed(2), col3, y);
      y += 18;

      if (y > doc.page.height - 120) {
        doc.addPage();
        y = 40;
        doc.font('Helvetica-Bold').fontSize(11);
        doc.text('Product Name', col1, y);
        doc.text('Sold Qty', col2, y);
        doc.text('Amount (Rs.)', col3, y);
        doc.moveDown(0.5);
        y += 20;
        doc.font('Helvetica').fontSize(10);
      }
    });

    // Financial Summary Section
    doc.moveDown(2);
    const summaryY = doc.y;
    doc.moveTo(startX, summaryY).lineTo(550, summaryY).strokeColor('#000000').stroke();
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12).text('Financial Summary', startX);
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(11);
    doc.text('Total Product Revenue:', startX + 250, doc.y, { continued: true });
    doc.text(` Rs.${totalProductRevenue.toFixed(2)}`, { align: 'right' });

    doc.text('Total Delivery Fees:', startX + 250, doc.y, { continued: true });
    doc.text(` +Rs.${totalDeliveryFees.toFixed(2)}`, { align: 'right' });

    if (totalDiscounts > 0) {
      doc.text('Total Discounts Given:', startX + 250, doc.y, { continued: true });
      doc.text(` -Rs.${totalDiscounts.toFixed(2)}`, { align: 'right', color: 'red' });
    }

    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#d946ef');
    doc.text('Net Collection:', startX + 250, doc.y, { continued: true });
    doc.text(` Rs.${netCollection.toFixed(2)}`, { align: 'right' });

    doc.end();
    return;
  }

  // Excel (.xlsx) Export
  if (format === 'excel' || format === 'xlsx') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    worksheet.columns = [
      { header: 'Product Name', key: 'name', width: 40 },
      { header: 'Quantity Sold', key: 'quantity', width: 15 },
      { header: 'Amount (₹)', key: 'revenue', width: 20 },
    ];

    // Styling headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' }
    };

    productSales.forEach(row => {
      worksheet.addRow({
        name: row.name,
        quantity: row.quantity,
        revenue: row.revenue
      });
    });

    // Add Financial Summary
    worksheet.addRow([]);
    worksheet.addRow(['Product Revenue Total', '', totalProductRevenue]).font = { bold: true };
    worksheet.addRow(['Total Delivery Fees', '', totalDeliveryFees]).font = { bold: true };
    if (totalDiscounts > 0) {
      worksheet.addRow(['Total Discounts Given', '', -totalDiscounts]).font = { bold: true, color: { argb: 'FFFF0000' } };
    }
    const finalRow = worksheet.addRow(['NET COLLECTION', '', netCollection]);
    finalRow.font = { bold: true, size: 12 };
    finalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD946EF' } };
    finalRow.getCell(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
    finalRow.getCell(3).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="sales-report.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
    return;
  }

  // Fallback to CSV if requested or default
  const lines = ['Product Name,Quantity Sold,Revenue (₹)'];
  productSales.forEach(row => {
    const safeName = `"${row.name.replace(/"/g, '""')}"`;
    lines.push(`${safeName},${row.quantity},${row.revenue.toFixed(2)}`);
  });
  const csv = lines.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="product-sales-report.csv"');
  res.send(csv);
});

// WhatsApp link builder
// WhatsApp link builder
app.post('/api/whatsapp-link', async (req, res) => {
  try {
    const { items: bodyItems, phone, customerName, address, paymentMethod, isOwner } = req.body || {};

    let sourceItems;
    if (Array.isArray(bodyItems) && bodyItems.length > 0) {
      sourceItems = bodyItems;
    } else {
      const cart = await getCart();
      sourceItems = cart.items || [];
    }

    const products = await Product.find({ id: { $in: sourceItems.map(i => i.productId) } }).lean();
    const productMap = new Map(products.map(p => [p.id, p]));

    const detailedItems = sourceItems.map(item => {
      const product = item.product || productMap.get(item.productId);
      if (!product) return null;
      const lineTotal = +(product.price * item.quantity).toFixed(2);
      return {
        productId: item.productId,
        quantity: item.quantity,
        product,
        lineTotal
      };
    }).filter(Boolean);

    const subtotal = +detailedItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2);
    const detailed = { items: detailedItems, subtotal, total: subtotal };

    const settings = await Settings.findOne().lean() || {};
    const whatsappNumber = settings.whatsappNumber || WHATSAPP_NUMBER;
    const number = (phone || whatsappNumber).replace(/[^0-9]/g, '');

    let header = '';

    if (isOwner) {
      header = `Hello ${customerName || 'Customer'},\n\nThank you for your order from *Sparkle Gift Shop*! 🎁\n\nHere are your order details:\n\n`;
      if (customerName) header += `*Name:* ${customerName}\n`;
      if (address) header += `*Address:* ${address}\n`;
      if (paymentMethod) header += `*Payment:* ${paymentMethod.toUpperCase()}\n`;
      header += '\n';
    } else {
      if (customerName || address || paymentMethod) {
        const parts = [];
        if (customerName) parts.push(`*Name:* ${customerName}`);
        if (address) parts.push(`*Address:* ${address}`);
        if (paymentMethod) parts.push(`*Payment:* ${paymentMethod.toUpperCase()}`);
        header = parts.join(' | ') + '\n\n';
      }
    }

    const text = encodeURIComponent(header) + cartSummaryText(detailed.items, detailed.total);
    const url = `https://wa.me/${number}?text=${text}`;
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Settings for business owner (UPI QR, WhatsApp number)
app.get('/api/settings', async (_req, res) => {
  const settings = await Settings.findOne();
  res.json(settings);
});

app.put('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    if (req.body.upiQrUrl !== undefined) settings.upiQrUrl = req.body.upiQrUrl;
    if (req.body.upiId !== undefined) settings.upiId = req.body.upiId.trim();
    if (req.body.whatsappNumber !== undefined) settings.whatsappNumber = req.body.whatsappNumber;
    if (req.body.logoUrl !== undefined) settings.logoUrl = req.body.logoUrl;
    if (req.body.reportUrl !== undefined) settings.reportUrl = req.body.reportUrl;
    if (req.body.storeName !== undefined) settings.storeName = req.body.storeName;

    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Coupons
app.get('/api/coupons', async (_req, res) => {
  const coupons = await Coupon.find();
  res.json(coupons);
});

app.post('/api/coupons', async (req, res) => {
  try {
    const { code, type, value, applicableTo, productIds } = req.body;
    if (!code || !value) {
      return res.status(400).json({ message: 'Code and value are required' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const newCoupon = new Coupon({
      id: `cp-${uuidv4()}`,
      code: code.toUpperCase(),
      type: type || 'percent',
      value: Number(value),
      applicableTo: applicableTo || 'all',
      productIds: Array.isArray(productIds) ? productIds : [],
    });

    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/coupons/:id', async (req, res) => {
  try {
    const result = await Coupon.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Coupon not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/verify-coupon', async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon' });
    }

    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/orders/:id/pdf', async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ id: req.params.id }, { invoiceId: req.params.id }]
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.invoiceId}.pdf"`);

    // 12x8 inch = 864 x 576 points (72 points per inch)
    const doc = new PDFDocument({
      margin: 0,
      size: [864, 576],
      bufferPages: false,
      autoFirstPage: true
    });
    doc.pipe(res);

    // Manual IST Calculation (GMT+5:30)
    const orderDate = new Date(order.createdAt);
    const istOrder = new Date(orderDate.getTime() + (5.5 * 60 * 60 * 1000));
    const now = new Date();
    const istNow = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));

    const formattedDate = `${istOrder.getUTCDate()}/${istOrder.getUTCMonth() + 1}/${istOrder.getUTCFullYear()}`;
    const formattedTime = `${istNow.getUTCHours() % 12 || 12}:${String(istNow.getUTCMinutes()).padStart(2, '0')} ${istNow.getUTCHours() >= 12 ? 'PM' : 'AM'}`;

    // Background Image or Color (Optional light background)
    doc.rect(0, 0, 864, 576).fill('#ffffff');

    // === HEADER SECTION ===
    // Left: Logo/Title
    doc.fillColor('#d946ef')
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('Sparkle Gift Shop', 40, 40);

    doc.fillColor('#64748b')
      .fontSize(12)
      .font('Helvetica')
      .text('Premium Gifts for Every Occasion', 40, 75);

    // Right: Invoice Info
    doc.fillColor('#0f172a')
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('INVOICE', 600, 40, { align: 'right', width: 224 });

    doc.fontSize(10).font('Helvetica');
    const invoiceMetaY = 80;
    doc.text(`Invoice #: ${order.invoiceId}`, 600, invoiceMetaY, { align: 'right', width: 224 });
    doc.text(`Date: ${formattedDate}`, 600, invoiceMetaY + 15, { align: 'right', width: 224 });
    doc.text(`Time: ${formattedTime}`, 600, invoiceMetaY + 30, { align: 'right', width: 224 });

    // === CUSTOMER & PAYMENT INFO ===
    const sectionY = 140;

    // Customer Box
    doc.rect(40, sectionY, 350, 100).fillAndStroke('#f8fafc', '#e2e8f0');
    doc.fillColor('#d946ef').font('Helvetica-Bold').fontSize(11).text('BILLED TO', 55, sectionY + 15);
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(14).text(order.customerName, 55, sectionY + 35);
    doc.font('Helvetica').fontSize(11);
    if (order.phone) doc.text(`Phone: ${order.phone}`, 55, sectionY + 58);
    if (order.address) doc.text(`Address: ${order.address}`, 55, sectionY + 75, { width: 320, ellipsis: true });

    // Payment Box
    doc.rect(474, sectionY, 350, 100).fillAndStroke('#f8fafc', '#e2e8f0');
    doc.fillColor('#d946ef').font('Helvetica-Bold').fontSize(11).text('PAYMENT METHOD', 490, sectionY + 15);
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(16).text(order.paymentMethod.toUpperCase(), 490, sectionY + 45);

    // === ITEMS TABLE ===
    const tableHeaderY = 270;
    const colName = 40;
    const colPrice = 500;
    const colQty = 600;
    const colTotal = 720;

    // Header Row
    doc.rect(40, tableHeaderY, 784, 30).fill('#d946ef');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11);
    doc.text('ITEM DESCRIPTION', colName + 10, tableHeaderY + 8);
    doc.text('PRICE', colPrice, tableHeaderY + 8, { align: 'right', width: 80 });
    doc.text('QTY', colQty, tableHeaderY + 8, { align: 'center', width: 50 });
    doc.text('TOTAL', colTotal, tableHeaderY + 8, { align: 'right', width: 90 });

    // Rows
    let rowY = tableHeaderY + 30;
    doc.font('Helvetica').fontSize(11).fillColor('#0f172a');

    (order.items || []).forEach((item, i) => {
      const isEven = i % 2 === 0;
      if (isEven) {
        doc.rect(40, rowY, 784, 30).fill('#fdf4ff'); // Alternating row color
      }
      doc.fillColor('#0f172a');

      const pName = item.product?.name || item.name || 'Unknown Product';
      const pPrice = item.product?.price || 0;

      doc.text(pName, colName + 10, rowY + 8);
      doc.text(`Rs.${pPrice}`, colPrice, rowY + 8, { align: 'right', width: 80 });
      doc.text(item.quantity, colQty, rowY + 8, { align: 'center', width: 50 });
      doc.text(`Rs.${item.lineTotal || 0}`, colTotal, rowY + 8, { align: 'right', width: 90 });

      rowY += 30;
    });

    // === FOOTER TOTALS ===
    const footerY = 450;
    const itemsCount = (order.items || []).length;
    // Don't draw too far down if many items, for simplicity assuming limited items for receipt size 
    // or we let it spill (but PDFKit requires addPage for spill).
    // Given 12x8 size, we have room.

    // Totals Box
    doc.rect(550, footerY, 274, 110).fillAndStroke('#ffffff', '#d946ef');

    let totalLineY = footerY + 15;
    const labelX = 570;
    const valX = 700;
    const valWidth = 110;

    doc.font('Helvetica').fontSize(11).fillColor('#64748b');

    doc.text('Subtotal:', labelX, totalLineY);
    doc.text(`Rs.${order.subtotal}`, valX, totalLineY, { align: 'right', width: valWidth });
    totalLineY += 20;

    if (order.deliveryFee > 0) {
      doc.text('Delivery Fee:', labelX, totalLineY);
      doc.text(`+ Rs.${order.deliveryFee}`, valX, totalLineY, { align: 'right', width: valWidth });
      totalLineY += 20;
    }

    if (order.discount > 0) {
      doc.text('Discount:', labelX, totalLineY);
      doc.text(`- Rs.${order.discount}`, valX, totalLineY, { align: 'right', width: valWidth, color: 'red' });
      totalLineY += 20;
    }

    // Divider
    doc.moveTo(560, totalLineY).lineTo(814, totalLineY).strokeColor('#e2e8f0').stroke();
    totalLineY += 10;

    // Grand Total
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#d946ef');
    doc.text('Grand Total:', labelX, totalLineY);
    doc.text(`Rs.${order.total}`, valX, totalLineY, { align: 'right', width: valWidth });

    // Footer Message
    doc.fontSize(10).fillColor('#64748b').text('Thank you for shopping with us! Visit again.', 40, 540);

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Serve static QR or assets if needed
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

ensureSeed().then(() => {
  server.listen(PORT, () => {
    console.log(`API ready on port ${PORT}`);
  });
});
