import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
    brandName: {
        type: String,
        required: true,
        unique: true 
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


export default mongoose.model("Brand", brandSchema);