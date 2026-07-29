import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './src/models/Settings.model.js';

dotenv.config();

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const shiprocketSettings = {
            email: 'dramardeshmukh3333@gmail.com',
            password: 'Amar#1234',
            apiKey: '&Lj!aesgUuDB3EcInhmqqjmP^YS@q03G',
        };

        const result = await Settings.findOneAndUpdate(
            { key: 'shiprocket' },
            { value: shiprocketSettings },
            { new: true, upsert: true }
        );

        console.log('Shiprocket settings seeded successfully:', result);
    } catch (err) {
        console.error('Error seeding settings:', err);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
