const Cart = require('../../models/cartSchema')
const Product = require('../../models/productSchema')
const mongoose = require('mongoose');
const { successResponse, errorResponse } = require('../../helpers/responseHandler')


const loadCartPage = async (req, res) => {
    try {
        const userName = req.session.userName
        const userId = req.session.user;

        const cart = await Cart.findOne({ userId })
            .populate({
                path: 'products.productId',
                populate: { path: 'brand category' }
            });

        if (!cart) {
            return res.render('cart', { userName, products: [] });
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



        res.render('cart', {
            userName,
            products,
            cart
        });


    } catch (error) {
        console.error('Error while loading cart page:', error);
        res.redirect("/pageNotfound")
    }
}

const addProductToCart = async (req, res) => {
    try {
        const userId = req.session.user;
        const { productId, quantity = 1 } = req.body;

        const quantityNumber = parseInt(quantity, 10);
        if (isNaN(quantityNumber) || quantityNumber <= 0) {
            return errorResponse(res, {}, 'Quantity must be a positive number', 400);
        }


        const product = await Product.findById(productId).select('salePrice')
        if (!product) {
            return errorResponse(res, {}, 'Product not found', 404);
        }

        const price = product.salePrice
        const totalPrice = quantityNumber * price


        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, products: [{ productId, quantity: quantityNumber, price, totalPrice }] });
        } else {
            const productIndex = cart.products.findIndex(p => p.productId.equals(productId));
            if (productIndex === -1) {
                cart.products.push({
                    productId,
                    quantity : quantityNumber ,
                    price,
                    totalPrice
                });
            } else {
                cart.products[productIndex].quantity += quantityNumber ;
                cart.products[productIndex].totalPrice = cart.products[productIndex].price * cart.products[productIndex].quantity;
            }
        }

        await cart.save();
        successResponse(res, {}, 'Product added to cart');
    } catch (error) {
        console.error(error);
        errorResponse(res, error, 'Server error');
    }
}


const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.body;
        const userId = req.session.user;

        await Cart.updateOne(
            { userId },
            { $pull: { products: { _id: new mongoose.Types.ObjectId(itemId) } } }
        );

        res.status(200).json({ success: true, message: "Product removed from cart." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to remove product from cart." });
    }
};


module.exports = {
    loadCartPage,
    addProductToCart,
    removeFromCart

}