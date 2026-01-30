const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Keeping 'id' for compatibility with existing string IDs
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, default: 'General' },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
});

module.exports = mongoose.model('Product', productSchema);
