const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    upiId: { type: String, default: '' },
    upiQrUrl: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    lastInvoiceNumber: { type: Number, default: 0 },
    reportUrl: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    storeName: { type: String, default: 'Sparkle Gift Shop' },
    comboBannerTitle: { type: String, default: 'Exclusive Combo Stores' },
    comboBannerSub: { type: String, default: 'Save more with our curated gift sets. Handpicked combinations for your loved ones.' },
    comboBannerDiscount: { type: String, default: 'Up to 30% OFF' },
    comboBannerActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Settings', settingsSchema);
