const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require(path.join(__dirname, '../src/models/User'));

const listAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admins = await User.find({ role: 'admin' });
        console.log('FOUND_ADMINS_START');
        admins.forEach(u => {
            console.log(`ADMIN_USER:${u.email}:${u.adminLevel}`);
        });
        console.log('FOUND_ADMINS_END');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
};

listAdmins();
