const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    invoiceNumber: { type: Number },
    invoiceSequence: { type: Number },
    invoiceId: { type: String },
    createdAt: { type: Date, default: Date.now, index: true },
    items: [
        {
            productId: String,
            quantity: Number,
            variantSize: String,
            variantPrice: Number,
            product: Object, // Embedded product details for snapshot
            lineTotal: Number
        }
    ],
    subtotal: Number,
    discount: Number,
    deliveryFee: Number,
    total: Number,
    customerName: { type: String, default: 'Walk-in' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    paymentMethod: { type: String, default: 'unknown' },
    dispatched: { type: Boolean, default: false },
    isPaid: { type: Boolean, default: false },
    paymentScreenshot: { type: String, default: '' },
    note: { type: String, default: '' }
});

module.exports = mongoose.model('Order', orderSchema);
