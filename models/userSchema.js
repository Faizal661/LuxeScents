const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
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
        required: false,
        unique: false

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
    wishlist:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Wishlist"
    }],
    orderHistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order"
    }],
    createdOn: {
        type: Date,
        default: Date.now
    },
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

//hashing password
// userSchema.pre('save', async function (next) {
//     if (this.isModified('password')) {
//         this.password = await bcrypt.hash(this.password, 10);
//     }
//     next();
// });

// userSchema.methods.isValidPassword = async function (password) {
//     return await bcrypt.compare(password, this.password);
// };


module.exports = mongoose.model('User', userSchema)