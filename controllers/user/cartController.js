const User = require('../../models/userSchema')
const Product = require('../../models/productSchema')
const { successResponse, errorResponse } = require('../../helpers/responseHandler')


const loadCartPage= async (req, res) => {
    try {
        if (req.session.user) {
            return res.render('cart')
        } else {
            res.redirect("/login")
        }
    } catch (error) {
        res.redirect("/pageNotfound")
    }
}


module.exports={
    loadCartPage,

}