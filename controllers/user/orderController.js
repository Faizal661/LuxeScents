const Product = require('../../models/productSchema')
const { successResponse, errorResponse } = require('../../helpers/responseHandler')
const Order = require('../../models/orderSchema'); 

const orderSuccess = async (req, res) => {
    try {
      res.render('orderSuccess')
    } catch (error) {
        console.error('Error while loading order Success page', error);
        res.redirect("/pageNotfound")
    }
};

const orderDetails= async (req, res) => {
    try {
      res.render('orderSuccess')
    } catch (error) {
        console.error('Error while loading order Success page', error);
        res.redirect("/pageNotfound")
    }
};


module.exports={
    orderSuccess,
    orderDetails
}