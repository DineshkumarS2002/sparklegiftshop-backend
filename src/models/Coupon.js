const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    type: { type: String, enum: ['percent', 'flat'], default: 'percent' },
    value: { type: Number, required: true },
    applicableTo: { type: String, enum: ['all', 'specific'], default: 'all' },
    productIds: [String],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Coupon', couponSchema);
