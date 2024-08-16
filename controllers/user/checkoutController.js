const User = require('../../models/userSchema')
const Product = require('../../models/productSchema')
const { successResponse, errorResponse } = require('../../helpers/responseHandler')


const loadCheckoutPage=  async (req, res) => {
    try {
        if (req.session.user) {
            return res.render('checkout')
        } else {
            res.redirect("/login")
        }
    } catch (error) {
        res.redirect("/pageNotfound")
    }
}


module.exports={
    loadCheckoutPage,

}