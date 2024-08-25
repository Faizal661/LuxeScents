const mongoose=require('mongoose')          

require('dotenv').config();

const DB_URI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB_NAME}?authSource=admin`;

const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log('mongodb √√√');
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
};

module.exports = connectDB;