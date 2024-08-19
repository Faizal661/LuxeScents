const User = require('../../models/userSchema')
const Product = require('../../models/productSchema')
const { successResponse, errorResponse } = require('../../helpers/responseHandler')


const loadCartPage= async (req, res) => {
    try {
        if (req.session.user) {
            const userName = req.session.userName

            return res.render('cart',{userName})
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