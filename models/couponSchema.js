const mongoose = require("mongoose")

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    expireOn: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        required: true,
        default: 1
    },
    usedCount: {
        type: Number,
        default: 0
    },
    offerPrice: {
        type: Number,
        required: true
    },
    minimumPrice: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, {
    timestamps: true
})

module.exports = mongoose.model("Coupon", couponSchema)