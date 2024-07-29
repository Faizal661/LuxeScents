const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    productName:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,
    },
    brand:{
        type:String,
        required:true,
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true,
    },
    regularPrice:{
        type:Number,
        required:true,
    },
    salePrice:{
        type:Number,
        required:true,
    },
    productOffer:{
        type:Number,
        default:0
    },
    quantity:{
        type:Number,
        required:true,
    },
    productImage:{
        type:[String],
        required:true,
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    status:{
        type:String,
        enum:["Available","Out of Stock","Discountinued"],
        required:true,
        default:"Available"
    }
},{timestamps:true});

module.exports=mongoose.model("Product",productSchema)