const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require(path.join(__dirname, '../src/models/User'));

const email = process.argv[2];

const promote = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB_CONNECTED');

        // Direct update to bypass potential save hooks or validation issues for now
        const result = await User.updateOne(
            { email: email },
            { $set: { adminLevel: 'super_admin', role: 'admin' } }
        );

        console.log('UPDATE_RESULT:', result);

    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

promote();
