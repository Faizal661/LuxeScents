const Cart = require('../../models/cartSchema')
const Product = require('../../models/productSchema')
const mongoose = require('mongoose');

const { successResponse, errorResponse } = require('../../helpers/responseHandler')


const loadCartPage = async (req, res) => {
    try {
        const userId = req.session.user;

        const cart = await Cart.findOne({ userId })
            .populate({
                path: 'products.productId',
                populate: { path: 'brand category' }
            });

        if (!cart) {
            return res.render('cart', { products: [] });
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
        });



        res.render('cart', {
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
        successResponse(res,{},"Product removed from cart.")
    } catch (error) {
        errorResponse(res, error, "Failed to remove product from cart.");
    }
};


const updateCartItem = async (req, res) => {
    const { productId, quantity } = req.body; // Here, productId is the _id of the product object in the products array, not the actual Product ID.
    try {
        const cart = await Cart.findOne({ "products._id": productId });

        if (cart) {

            const product = cart.products.find(p => p._id.toString() === productId);
            if (product) {
                const totalPrice = product.price * quantity; 
                await Cart.findOneAndUpdate(
                    { "products._id": productId },
                    {
                        $set: {
                            "products.$.quantity": quantity,
                            "products.$.totalPrice": totalPrice
                        }
                    },
                    { new: true }
                );
                res.json({ success: true, totalPrice });
            } else {
                res.json({ success: false, message: 'Product not found in cart.' });
            }
        } else {
            res.json({ success: false, message: 'Cart item not found.' });
        }
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ success: false, message: 'Error updating cart item.' });
    }
};


const cartTotal = async (req, res) => {
    try {
        const userId = req.session.user; 
        const cart = await Cart.findOne({ userId });
  
        if (cart) {
            const subtotal = cart.products.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            const total = subtotal;
            res.json({ success: true, subtotal, total });
        } else {
            res.json({ success: false, message: 'Cart not found.' });
        }
    } catch (error) {
        console.error('Error fetching cart total:', error);
        res.status(500).json({ success: false, message: 'Error fetching cart total.' });
    }
};


module.exports = {
    loadCartPage,
    addProductToCart,
    removeFromCart,
    updateCartItem,
    cartTotal

}