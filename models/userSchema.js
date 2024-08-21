const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: false,
        unique: false,
        sparse: true,
        default: null
    },
    googleId: {
        type: String,
    },
    password: {
        type: String,
        required: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    cart: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Cart"
    }],
    wallet:{
        type:Number,
        default:0
    },
    wishlist:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Wishlist"
    },
    orderHistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order"
    }],
    searchHistory:[{
        category:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Category"
        },
        brand:{
            type:String,
        },
        searchOn:{
            type:Date,
            default:Date.now
        }
    }],
   
},{timestamps:true});


module.exports = mongoose.model('User', userSchema)