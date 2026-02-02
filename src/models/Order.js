const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
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
            variantColor: String,
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
    delivered: { type: Boolean, default: false },
    isPaid: { type: Boolean, default: false },
    paymentScreenshot: { type: String, default: '' },
    note: { type: String, default: '' },

    // Tracking Fields
    courierPartner: { type: String, default: '' },
    trackingId: { type: String, default: '' },
    trackingEvents: [
        {
            message: String,
            location: String,
            updatedAt: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model('Order', orderSchema);
