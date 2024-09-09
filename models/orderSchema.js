const mongoose = require("mongoose")

const { v4: uuidv4 } = require('uuid')
const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        default: () => uuidv4(),
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    orderedItems: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        size: {
            type: String,
            enum: ["25ml", "50ml", "75ml", "100ml", "150ml"],
            required: true,
        },
        price: {
            type: Number,
            default: 0
        },
        variationID: {
            type: String,
            required: true
        }
    }],
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        required: true
    },
    address: {
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
        }
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Wallet', 'Card', 'RazorPay'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending'],
        default: 'Pending'
    },
    razorpay: {
        paymentId: { type: String },
        orderId: { type: String }
    },
    orderStatus: {
        type: String,
        required: true,
        default: 'Processing',
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Request', 'Returned']
    },
    couponApplied: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model("Order", orderSchema)