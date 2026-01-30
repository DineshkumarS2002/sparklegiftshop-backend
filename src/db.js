const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/giftshop';
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB ✅');
    } catch (err) {
        console.error('MongoDB connection error ❌:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
