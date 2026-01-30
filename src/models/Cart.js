const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    items: [
        {
            productId: { type: String, required: true },
            quantity: { type: Number, default: 1 }
        }
    ]
});

module.exports = mongoose.model('Cart', cartSchema);
