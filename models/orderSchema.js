const mongoose= require("mongoose")

const {v4:uuidv4} = require('uuid')
const orderSchema= new mongoose.Schema({
    orderId:{
        type:String,
        default: ()=>uuidv4(),
        unique:true
    },
    orderedItems:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        price:{
            type:Number,
            default:0
        }
    }],
    totalPrice:{
        type:Number,
        required:true
    },
    discount:{
        type:Number,
        default:0
    },
    finalAmount:{
        type:Number,
        required:true
    },
    address:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Wallet', 'Card', 'UPI'],
        required: true
    },
    orderStatus:{
        type:String,
        required:true,
        default:'Processing',
        enum:['Processing','Shipped','Delivered','Cancelled','Return Request','Returned']
    },
    couponApplied:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

module.exports= mongoose.model("Order",orderSchema)