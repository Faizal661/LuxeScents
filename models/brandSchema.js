const mongoose = require("mongoose")

const brandSchema = new mongoose.Schema({
    brandName:{
        type:String,
        required:true
    },
    // brnadImage:{
    //     type:[String],
    //     required:true
    // },
    isBlocked:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Brand",brandSchema)