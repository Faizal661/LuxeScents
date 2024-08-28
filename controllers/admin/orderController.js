const User= require('../../models/userSchema')
const Order= require('../../models/orderSchema')
const { successResponse, errorResponse } = require('../../helpers/responseHandler')

const orderInfo= async (req,res)=>{
    try {
        res.render('ordersInfo')
    } catch (error) {
        console.error('Error while loading order listing page:', error);
        res.redirect("/pageerror");
    }
}




module.exports={
    orderInfo
}