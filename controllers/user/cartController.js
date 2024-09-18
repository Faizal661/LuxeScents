const Cart = require('../../models/cartSchema')
const Product = require('../../models/productSchema')
const mongoose = require('mongoose');

const { successResponse, errorResponse } = require('../../helpers/responseHandler')


const loadCartPage = async (req, res) => {
    try {
        const userId = req.session.user;

        const cart = await Cart.findOne({ userId })//looking for user cart is already there or not
            .populate({
                path: 'products.productId',
                populate: { path: 'brand category' }
            })

        if (!cart) {//if there is no cart .creating new one
            return res.render('cart', { products: [] });
        }

        let totalOfferDiscount = 0;

        const products = cart.products.map(item => {
            const product = item.productId;
            const variation = product.variations.filter((vari) => vari._id.toString() === item.variationID.toString())
            // console.log('variation',variation)

            const offerDiscount = (product.offerPercentage * variation[0].salePrice / 100) * item.quantity;
            // console.log('product.offerPercentage',product.offerPercentage)
            // console.log('variation.salePrice',variation[0].salePrice)
            // console.log('item.quantity',item.quantity)

            totalOfferDiscount += offerDiscount;
            // console.log('offerdiscount',offerDiscount)
            // console.log('totalOfferDiscount',totalOfferDiscount)

            return {
                _id: item._id,// _id of objects in cart
                productId: item.productId._id,// _id of product in cart
                productName: product.productName,
                salePrice: variation[0].salePrice,
                quantity: item.quantity,//cart added quantity of that product
                totalPrice: item.totalPrice,
                productImages: product.productImages,
                stock: variation[0].quantity,
                size: variation[0].size,
                offerDiscount: offerDiscount

            };
        });

        //calculating subtotal,tax and grandtotal to display in the price details.
        const subtotal = cart.products.reduce((sum, item) => sum + (item.quantity * item.price), 0) - totalOfferDiscount;
        const tax = (subtotal * 10) / 100;

        const grandTotal = subtotal + tax;


        res.render('cart', {
            products,
            cart,
            subtotal,
            tax,
            grandTotal,
            totalOfferDiscount
        });


    } catch (error) {
        console.error('Error while loading cart page:', error);
        res.redirect("/pageNotfound")
    }
}

const addProductToCart = async (req, res) => {
    try {
        const userId = req.session.user;
        const { productId, quantity = 1, variation_id } = req.body;
        const quantityNumber = parseInt(quantity);
        const product = await Product.findById(productId).select('variations')//FIND all the variations from the product data
        if (!product) {
            return errorResponse(res, {}, 'Product not found', 404);
        }
        let price = 0
        let variationID = variation_id;
        if (variation_id) {
            let selectedVariation = product.variations.filter((variation) => variation._id.toString() == variation_id.toString())
            price = selectedVariation[0].salePrice
            variationID = selectedVariation[0]._id//in this case it take the id of filtered variation.it is filter like an array  so we need to gave an index.
        } else {
            price = product.variations[0].salePrice//In shop page, defaultly add first product into the cart
            variationID = product.variations[0]._id
        }
        const totalPrice = quantityNumber * price
        let cart = await Cart.findOne({ userId });//check for if the cart is already created for this user
        if (!cart) {
            cart = new Cart({ userId, products: [{ productId, quantity: quantityNumber, price, totalPrice, variationID }] });
        } else {
            // const productIndex = cart.products.findIndex(p => p.productId.equals(productId));//check this product is in user cart
            const variationIndex = cart.products.findIndex(v => v.variationID.equals(variationID))
            if (variationIndex === -1) {
                cart.products.push({
                    productId,
                    quantity: quantityNumber,
                    price,
                    totalPrice,
                    variationID
                });
            } else {
                cart.products[variationIndex].quantity = quantityNumber;
                cart.products[variationIndex].totalPrice = cart.products[variationIndex].price * cart.products[variationIndex].quantity;
            }
        }
        await cart.save();
        successResponse(res, {}, 'Product added to cart');
    } catch (error) {
        console.error(error);
        res.redirect("/pageNotfound")
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
        successResponse(res, {}, "Product removed from cart.")
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
            const tax = (subtotal * 10) / 100;
            const total = subtotal + tax;
            res.json({ success: true, subtotal, total, tax });
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