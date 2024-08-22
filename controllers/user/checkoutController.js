const User = require('../../models/userSchema')
const Product = require('../../models/productSchema')
const Cart = require('../../models/cartSchema')
const { successResponse, errorResponse } = require('../../helpers/responseHandler')


const loadCheckoutPage = async (req, res) => {
    try {
        if (req.session.user) {
            const userName = req.session.userName
            const userId = req.session.user;

            const cart = await Cart.findOne({ userId })
                .populate({
                    path: 'products.productId',
                    populate: { path: 'brand category' }
                });

            if (!cart) {
                return res.render('checkout', { userName, products: [] });
            }

            const products = cart.products.map(item => {
                const product = item.productId;
                return {
                    _id: item._id,
                    productName: product.productName,
                    salePrice: product.salePrice,
                    quantity: item.quantity,
                    totalPrice: item.totalPrice,
                    productImages: product.productImages,
                };
            }); 3


            res.render('checkout', {
                userName,
                products,
                cart
            });

        } else {
            res.redirect("/login")
        }

    } catch (error) {
        console.error('Error while loading checkout page:', error);
        res.redirect("/pageNotfound")
    }
}

const orderSuccess = async (req, res) => {
    try {
        if (req.session.user) {
            res.render('orderSuccess')
        } else {
            res.redirect("/login")
        }
    } catch (error) {
        console.error('Error while loading order Success page:', error);
        res.redirect("/pageNotfound")
    }

}






module.exports = {
    loadCheckoutPage,
    orderSuccess

}