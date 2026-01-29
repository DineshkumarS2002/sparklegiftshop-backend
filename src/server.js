const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { readJson, writeJson } = require('./storage');

const PORT = process.env.PORT || 4000;
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '1234567890';
const PRODUCT_FILE = 'products.json';
const CART_FILE = 'cart.json';
const ORDER_FILE = 'orders.json';
const SETTINGS_FILE = 'settings.json';

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

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

async function getProducts() {
  return readJson(PRODUCT_FILE, seedProducts);
}

async function saveProducts(products) {
  await writeJson(PRODUCT_FILE, products);
}

async function getCart() {
  return readJson(CART_FILE, { items: [] });
}

async function saveCart(cart) {
  await writeJson(CART_FILE, cart);
}

async function getOrders() {
  return readJson(ORDER_FILE, []);
}

async function saveOrders(orders) {
  await writeJson(ORDER_FILE, orders);
}

async function getSettings() {
  const defaultReportUrl = 'https://docs.google.com/spreadsheets/d/1LYhiIzuFm1FHrxEVl1aHczda5XyQABozK8rpfGFc6XE/edit?gid=0#gid=0';
  const fallback = {
    upiQrUrl:
      'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=Gift%20Shop%20Payment',
    whatsappNumber: WHATSAPP_NUMBER,
    lastInvoiceNumber: 0,
    reportUrl: defaultReportUrl
  };
  const settings = await readJson(SETTINGS_FILE, fallback);
  // Ensure reportUrl exists for older settings.json files
  if (!settings.reportUrl) settings.reportUrl = defaultReportUrl;
  return settings;
}

async function saveSettings(settings) {
  await writeJson(SETTINGS_FILE, settings);
}

async function ensureSeed() {
  const products = await getProducts();
  if (!products || products.length === 0) {
    await saveProducts(seedProducts);
  }
  await getCart();
  await getOrders();
  await getSettings();
}

async function nextInvoice() {
  const orders = await getOrders();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

  // Get highest sequence number for today
  const todayOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(dateStr));
  const maxSeq = todayOrders.reduce((max, o) => Math.max(max, o.invoiceSequence || o.invoiceNumber || 0), 0);
  const nextSeq = maxSeq + 1;

  // Format: BILL-DDMMYY-SEQ (e.g. BILL-290126-001)
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
      const product = map.get(item.productId);
      if (!product) return null;
      const lineTotal = +(product.price * item.quantity).toFixed(2);
      return { ...item, product, lineTotal };
    })
    .filter(Boolean);
  const subtotal = +items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2);
  return { items, subtotal, total: subtotal };
}

function summarizeOrders(orders, range = 'daily') {
  const groups = new Map();
  orders.forEach((order) => {
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

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Products CRUD
app.get('/api/products', async (_req, res) => {
  const products = await getProducts();
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const { name, price, category, image, description } = req.body;
  if (!name || !price) {
    return res.status(400).json({ message: 'name and price are required' });
  }
  const products = await getProducts();
  const newProduct = {
    id: `p-${uuidv4()}`,
    name,
    price: Number(price),
    category: category || 'General',
    image: image || '',
    description: description || '',
  };
  products.push(newProduct);
  await saveProducts(products);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', async (req, res) => {
  const products = await getProducts();
  const idx = products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Product not found' });
  products[idx] = { ...products[idx], ...req.body, price: Number(req.body.price || products[idx].price) };
  await saveProducts(products);
  res.json(products[idx]);
});

app.delete('/api/products/:id', async (req, res) => {
  const products = await getProducts();
  const filtered = products.filter((p) => p.id !== req.params.id);
  if (filtered.length === products.length) return res.status(404).json({ message: 'Product not found' });
  await saveProducts(filtered);
  res.status(204).end();
});

// Cart operations
app.get('/api/cart', async (_req, res) => {
  const [cart, products] = await Promise.all([getCart(), getProducts()]);
  res.json(withProductDetails(cart.items || [], products));
});

app.post('/api/cart/add', async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const products = await getProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const cart = await getCart();
  const existing = cart.items.find((item) => item.productId === productId);
  if (existing) existing.quantity += Number(quantity) || 1;
  else cart.items.push({ productId, quantity: Number(quantity) || 1 });
  await saveCart(cart);
  res.json(withProductDetails(cart.items, products));
});

app.put('/api/cart/item/:productId', async (req, res) => {
  const quantity = Number(req.body.quantity);
  const { productId } = req.params;
  const cart = await getCart();
  const item = cart.items.find((i) => i.productId === productId);
  if (!item) return res.status(404).json({ message: 'Cart item not found' });
  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.productId !== productId);
  } else {
    item.quantity = quantity;
  }
  await saveCart(cart);
  const products = await getProducts();
  res.json(withProductDetails(cart.items, products));
});

app.post('/api/cart/clear', async (_req, res) => {
  await saveCart({ items: [] });
  const products = await getProducts();
  res.json(withProductDetails([], products));
});

// Orders
app.get('/api/orders', async (_req, res) => {
  const orders = await getOrders();
  res.json(orders);
});

app.get('/api/orders/:id', async (req, res) => {
  const orders = await getOrders();
  const order = orders.find((o) => o.id === req.params.id || o.invoiceId === req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

app.delete('/api/orders/:id', async (req, res) => {
  const orders = await getOrders();
  const filtered = orders.filter((o) => o.id !== req.params.id && o.invoiceId !== req.params.id);
  if (filtered.length === orders.length) return res.status(404).json({ message: 'Order not found' });
  await saveOrders(filtered);
  res.status(204).end();
});

app.patch('/api/orders/:id/dispatch', async (req, res) => {
  const orders = await getOrders();
  // Strictly find by unique internal ID to avoid conflicting with duplicate invoice numbers if any
  const idx = orders.findIndex((o) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Order not found' });

  orders[idx].dispatched = req.body.dispatched !== undefined ? req.body.dispatched : !orders[idx].dispatched;
  await saveOrders(orders);
  res.json(orders[idx]);
});

app.post('/api/orders', async (req, res) => {
  const { items: bodyItems, customerName, phone, address, paymentMethod, couponCode, note } =
    req.body || {};

  const products = await getProducts();
  const cart = await getCart();
  const coupons = await getCoupons();

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

  // Delivery fee logic: ₹50 if original subtotal < ₹500
  const deliveryFee = subtotal < 500 ? 50 : 0;
  const finalTotal = discountedSubtotal + deliveryFee;

  const invoice = await nextInvoice();
  const order = {
    id: `o-${uuidv4()}`,
    invoiceNumber: invoice.invoiceNumber,
    invoiceSequence: invoice.invoiceSequence,
    invoiceId: invoice.invoiceId,
    createdAt: new Date().toISOString(),
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

  const orders = await getOrders();
  orders.push(order);
  await Promise.all([saveOrders(orders), saveCart({ items: [] })]);
  res.status(201).json(order);
});

// Reports
app.get('/api/reports/summary', async (req, res) => {
  const range = req.query.range || 'daily';
  const orders = await getOrders();
  res.json(summarizeOrders(orders, range));
});

// Helper to group sales by product
function summarizeProductSales(orders) {
  const productStats = new Map();

  orders.forEach(order => {
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

app.get('/api/reports/export', async (req, res) => {
  const range = req.query.range || 'daily';
  const format = (req.query.format || '').toLowerCase();
  const orders = await getOrders();

  // Filter orders by range if needed (currently summarizeOrders filters by grouping, but for full export we might want all data or filtered data)
  // For simplicity, we export based on the full dataset unless we implement specific date filtering logic here.
  // The summary text shows "Range: ...", so implied filtering. 
  // Let's assume 'orders' contains all history, and we should ideally filter them.
  // Using the summarizeOrders logic to filter is complex without refactoring. 
  // We will assume "Product Wise Report" typically means "All Time" or "Current Selection".
  // Let's stick to the user's implicit context of 'Product Wise Report'.

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
    doc.fontSize(10).fillColor('#64748b').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
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
    doc.text('Amount (₹)', col3, doc.y);
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
        doc.text('Amount (₹)', col3, y);
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
    doc.text(` ₹${totalProductRevenue.toFixed(2)}`, { align: 'right' });

    doc.text('Total Delivery Fees:', startX + 250, doc.y, { continued: true });
    doc.text(` +₹${totalDeliveryFees.toFixed(2)}`, { align: 'right' });

    if (totalDiscounts > 0) {
      doc.text('Total Discounts Given:', startX + 250, doc.y, { continued: true });
      doc.text(` -₹${totalDiscounts.toFixed(2)}`, { align: 'right', color: 'red' });
    }

    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#d946ef');
    doc.text('Net Collection:', startX + 250, doc.y, { continued: true });
    doc.text(` ₹${netCollection.toFixed(2)}`, { align: 'right' });

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
app.post('/api/whatsapp-link', async (req, res) => {
  const { items: bodyItems, phone, customerName, address, paymentMethod, isOwner } = req.body || {};
  const products = await getProducts();
  const cart = await getCart();
  const sourceItems = Array.isArray(bodyItems) && bodyItems.length ? bodyItems : cart.items;
  const detailed = withProductDetails(sourceItems, products);
  const settings = await getSettings();
  const number = (phone || settings.whatsappNumber || WHATSAPP_NUMBER).replace(/[^0-9]/g, '');

  let header = '';

  // Owner side - add greeting message
  if (isOwner) {
    header = `Hello ${customerName || 'Customer'},\n\nThank you for your order from *Sparkle Gift Shop*! 🎁\n\nHere are your order details:\n\n`;
    if (customerName) header += `*Name:* ${customerName}\n`;
    if (address) header += `*Address:* ${address}\n`;
    if (paymentMethod) header += `*Payment:* ${paymentMethod.toUpperCase()}\n`;
    header += '\n';
  } else {
    // Client side - simple header
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
});

// Settings for business owner (UPI QR, WhatsApp number)
app.get('/api/settings', async (_req, res) => {
  const settings = await getSettings();
  res.json(settings);
});

app.put('/api/settings', async (req, res) => {
  const current = await getSettings();
  const next = {
    ...current,
    upiQrUrl: req.body.upiQrUrl !== undefined ? req.body.upiQrUrl : current.upiQrUrl,
    whatsappNumber: req.body.whatsappNumber !== undefined ? req.body.whatsappNumber : current.whatsappNumber,
    logoUrl: req.body.logoUrl !== undefined ? req.body.logoUrl : current.logoUrl,
    reportUrl: req.body.reportUrl !== undefined ? req.body.reportUrl : current.reportUrl,
  };
  await saveSettings(next);
  res.json(next);
});

// Serve static QR or assets if needed
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

ensureSeed().then(() => {
  app.listen(PORT, () => {
    console.log(`API ready on port ${PORT}`);
  });
});

// Coupons
const COUPON_FILE = 'coupons.json';

async function getCoupons() {
  return readJson(COUPON_FILE, []);
}

async function saveCoupons(coupons) {
  await writeJson(COUPON_FILE, coupons);
}

app.get('/api/coupons', async (_req, res) => {
  const coupons = await getCoupons();
  res.json(coupons);
});

app.post('/api/coupons', async (req, res) => {
  const { code, type, value, applicableTo, productIds } = req.body;
  if (!code || !value) {
    return res.status(400).json({ message: 'Code and value are required' });
  }
  const coupons = await getCoupons();
  if (coupons.find(c => c.code === code)) {
    return res.status(400).json({ message: 'Coupon code already exists' });
  }

  const newCoupon = {
    id: `cp-${uuidv4()}`,
    code: code.toUpperCase(),
    type: type || 'percent', // percent | flat
    value: Number(value),
    applicableTo: applicableTo || 'all', // all | specific
    productIds: Array.isArray(productIds) ? productIds : [],
    createdAt: new Date().toISOString()
  };

  coupons.push(newCoupon);
  await saveCoupons(coupons);
  res.status(201).json(newCoupon);
});

app.delete('/api/coupons/:id', async (req, res) => {
  const coupons = await getCoupons();
  const filtered = coupons.filter(c => c.id !== req.params.id);
  if (filtered.length === coupons.length) return res.status(404).json({ message: 'Coupon not found' });
  await saveCoupons(filtered);
  res.status(204).end();
});

app.post('/api/verify-coupon', async (req, res) => {
  const { code } = req.body;
  const coupons = await getCoupons();
  const coupon = coupons.find(c => c.code === code.toUpperCase());

  if (!coupon) {
    return res.status(404).json({ message: 'Invalid coupon' });
  }

  res.json(coupon);
});

app.get('/api/orders/:id/pdf', async (req, res) => {
  const orders = await getOrders();
  const order = orders.find((o) => o.id === req.params.id || o.invoiceId === req.params.id);
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

  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const currentDate = now.toLocaleDateString('en-IN');

  // Shop Header
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#d946ef').text('Sparkle Gift Shop', 35, 35);
  doc.fontSize(8).font('Helvetica').fillColor('#64748b').text('Premium Personalized Gifts', 35, 56);

  // Invoice Title & Meta
  doc.fontSize(20).font('Helvetica-Bold').fillColor('#0f172a').text('INVOICE', 700, 35);
  doc.fontSize(8).font('Helvetica').fillColor('#64748b').text(`#${order.invoiceId}`, 700, 58);
  doc.text(`${currentDate} ${currentTime}`, 700, 70);

  // Issued By (left) and Invoice To (right) - single line
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#64748b').text('ISSUED BY:', 35, 90);
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#d946ef').text('Sparkle Gift Shop', 35, 102);
  doc.fontSize(7).font('Helvetica').fillColor('#0f172a').text('DGL-624005 | Ph: +91 6381830479', 35, 114);

  doc.fontSize(7).font('Helvetica-Bold').fillColor('#64748b').text('INVOICE TO:', 450, 90);
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a').text(order.customerName, 450, 102);
  doc.fontSize(7).font('Helvetica').fillColor('#0f172a').text(order.phone, 450, 114);
  doc.fontSize(7).text(order.address || 'No address', 450, 124, { width: 380, lineGap: -1 });

  // Payment
  doc.fontSize(7).font('Helvetica').fillColor('#64748b').text('Payment:', 35, 140);
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#0f172a').text(order.paymentMethod.toUpperCase(), 80, 140);

  // Table Header
  const tableTop = 160;
  doc.save().fillColor('#f8fafc').rect(35, tableTop, 794, 20).fill().restore();
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748b');
  doc.text('Item Description', 42, tableTop + 6);
  doc.text('Qty', 600, tableTop + 6, { width: 45, align: 'center' });
  doc.text('Price', 655, tableTop + 6, { width: 70, align: 'right' });
  doc.text('Total', 735, tableTop + 6, { width: 85, align: 'right' });

  // Table Rows - calculate height dynamically
  let itemY = tableTop + 20;
  const maxItemSpace = 280; // Maximum space for items
  const numItems = order.items.length;
  const itemHeight = Math.min(30, Math.floor(maxItemSpace / numItems));

  order.items.forEach((it, idx) => {
    // Alternating row colors
    if (idx % 2 === 0) {
      doc.save().fillColor('#ffffff').rect(35, itemY, 794, itemHeight).fill().restore();
    } else {
      doc.save().fillColor('#fafafa').rect(35, itemY, 794, itemHeight).fill().restore();
    }

    const textY = itemY + Math.floor(itemHeight / 3);
    const categoryY = itemY + Math.floor(itemHeight * 0.65);

    doc.fontSize(8).font('Helvetica-Bold').fillColor('#0f172a').text(it.product?.name || `Product ${it.productId}`, 42, textY, { width: 540, ellipsis: true });
    if (itemHeight > 25) {
      doc.fontSize(6).font('Helvetica').fillColor('#64748b').text(it.product?.category || '', 42, categoryY);
    }

    doc.fontSize(8).font('Helvetica-Bold').fillColor('#0f172a').text(String(it.quantity), 600, textY, { width: 45, align: 'center' });
    doc.text(`₹${it.product?.price}`, 655, textY, { width: 70, align: 'right' });
    doc.text(`₹${it.lineTotal.toFixed(2)}`, 735, textY, { width: 85, align: 'right' });

    itemY += itemHeight;
  });

  // Totals - fixed position
  let totalsY = 460;
  const totalsX = 620;

  doc.fontSize(8).font('Helvetica').fillColor('#64748b');
  doc.text('Subtotal:', totalsX, totalsY);
  doc.font('Helvetica-Bold').fillColor('#0f172a').text(`₹${order.subtotal.toFixed(2)}`, 735, totalsY, { width: 85, align: 'right' });

  if (order.discount > 0) {
    totalsY += 14;
    doc.font('Helvetica').fillColor('#10b981').text('Discount:', totalsX, totalsY);
    doc.font('Helvetica-Bold').text(`-₹${order.discount.toFixed(2)}`, 735, totalsY, { width: 85, align: 'right' });
  }

  totalsY += 14;
  doc.font('Helvetica').fillColor('#64748b').text('Delivery Fee:', totalsX, totalsY);
  doc.font('Helvetica-Bold').fillColor('#10b981').text(order.deliveryFee > 0 ? `₹${order.deliveryFee.toFixed(2)}` : 'FREE', 735, totalsY, { width: 85, align: 'right' });

  // Grand Total - fixed position
  totalsY += 18;
  doc.save().fillColor('#d946ef').rect(35, totalsY - 3, 794, 28).fill().restore();
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#ffffff').text('Grand Total:', 42, totalsY + 3);
  doc.fontSize(15).text(`₹${order.total.toFixed(2)}`, 735, totalsY + 2, { width: 85, align: 'right' });

  // Footer - fixed at bottom
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#0f172a').text('Thank you for your order!', 35, 540, { align: 'center', width: 794 });
  doc.fontSize(6).font('Helvetica').fillColor('#64748b').text('This is a system generated invoice.', 35, 552, { align: 'center', width: 794 });

  doc.end();
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Handle client-side routing - must be last
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
});

ensureSeed().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API ready on port ${PORT}`);
    console.log(`Access from other devices using your IP address: http://<YOUR_IP>:${PORT}`);
  });
});

