const mongoose = require("mongoose")

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    expireOn: {
        type: Date,
        required: true
    },
    offerPrice: {
        type: Number,
        required: true
    },
    minimumPrice: {
        type: Number,
        required: true
    },
    isList: {
        type: Boolean,
        default: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",

    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Coupon", couponSchema)