const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    addressType: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    locality: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    landMark: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    altPhone: {
        type: String
    },  
    isActive: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema)
