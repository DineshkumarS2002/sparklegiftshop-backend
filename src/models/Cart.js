const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    items: [
        {
            productId: { type: String, required: true },
            quantity: { type: Number, default: 1 },
            variantSize: { type: String }, // Selected variant size (e.g., "12x8")
            variantPrice: { type: Number }, // Price of selected variant
            variantOriginalPrice: { type: Number } // Original price of selected variant
        }
    ]
});

module.exports = mongoose.model('Cart', cartSchema);
