const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    items: [
        {
            productId: { type: String, required: true },
            quantity: { type: Number, default: 1 },
            variantSize: { type: String }, // Selected variant size (e.g., "12x8")
            variantColor: { type: String }, // Selected variant color (e.g., "#ff0000")
            variantPrice: { type: Number }, // Price of selected variant
            variantOriginalPrice: { type: Number } // Original price of selected variant
        }
    ]
});

module.exports = mongoose.model('Cart', cartSchema);
