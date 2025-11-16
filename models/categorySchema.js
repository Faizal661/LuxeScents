import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    isListed: {
        type: Boolean,
        default: true
    },
    offerPercentage: {
        type: Number,
        default: 0
    },
}, { timestamps: true });


export default mongoose.model("Category", categorySchema);