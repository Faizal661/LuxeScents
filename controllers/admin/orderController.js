const User= require('../../models/userSchema')
const Order= require('../../models/orderSchema')
const { successResponse, errorResponse } = require('../../helpers/responseHandler')

const orderInfo= async (req,res)=>{
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).populate('userId')

        res.render('ordersInfo' ,{ orders })
    } catch (error) {
        console.error('Error while loading order listing page:', error);
        res.redirect("/pageerror");
    }
}




module.exports={
    orderInfo
}