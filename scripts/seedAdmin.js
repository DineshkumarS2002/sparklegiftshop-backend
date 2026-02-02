require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sparkle-gift-shop');
        console.log('Connected to MongoDB for seeding...');

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@sparklegifts.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
        const adminName = process.env.ADMIN_NAME || 'System Admin';

        const existing = await User.findOne({ email: adminEmail });
        if (existing) {
            console.log('Admin already exists. Updating privileges...');
            existing.role = 'admin';
            existing.adminLevel = 'super_admin';
            existing.isEmailVerified = true;
            existing.password = adminPassword; // Pre-save hook will hash it
            await existing.save();
            console.log('Admin updated successfully.');
        } else {
            const admin = new User({
                name: adminName,
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                adminLevel: 'super_admin',
                isEmailVerified: true
            });
            await admin.save();
            console.log('New Admin created successfully.');
        }

        console.log('--- Admin Credentials ---');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('-------------------------');

        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedAdmin();
