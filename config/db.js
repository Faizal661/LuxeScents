const mongoose=require('mongoose')          

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('mongodb ✅');
    } catch (error) {
        console.error('Error connecting to the database:❌❌❌', error);
        process.exit(1);
    }
};

module.exports = connectDB;