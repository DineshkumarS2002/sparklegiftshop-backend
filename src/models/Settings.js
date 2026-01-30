const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    upiId: { type: String, default: '' },
    upiQrUrl: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    lastInvoiceNumber: { type: Number, default: 0 },
    reportUrl: { type: String, default: '' },
    logoUrl: { type: String, default: '' }
});

module.exports = mongoose.model('Settings', settingsSchema);
