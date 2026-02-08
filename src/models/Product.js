const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Keeping 'id' for compatibility with existing string IDs
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number }, // Actual price before offer
    category: { type: String, default: 'General' },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    isCombo: { type: Boolean, default: false },
    variants: [{
        size: { type: String, default: '' }, // e.g., "12x8", "10x15"
        color: { type: String, default: '' }, // e.g., "#ff0000" or "Red"
        price: { type: Number, required: true },
        originalPrice: { type: Number },
        image: { type: String } // Optional: specific image for this variant
    }],
    comboItems: [{
        name: { type: String },
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 },
        image: { type: String },
        variantSize: { type: String },
        variantColor: { type: String }
    }]
});

module.exports = mongoose.model('Product', productSchema);
