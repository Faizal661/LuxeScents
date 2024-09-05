const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
    },
    transactions: [
        {
            amount: {
                type: Number,
                required: true
            },
            orderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Order'
            },
            productId: {
                type: mongoose.Schema.Types.Mixed
            },
            for: {
                type: String,
                default: "Return"
            },
            status: {
                type: String,
                default: "pending"
            }, 
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
});

module.exports = mongoose.model('Wallet', walletSchema)