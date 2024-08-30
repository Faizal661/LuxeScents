const User = require('../../models/userSchema')
const Product = require('../../models/productSchema')
const Cart = require('../../models/cartSchema')
const Address = require('../../models/addressSchema')
const Order = require('../../models/orderSchema')
const { successResponse, errorResponse } = require('../../helpers/responseHandler')


const loadCheckoutPage = async (req, res) => {
    try {
        if (req.session.user) {
            const userId = req.session.user;

            const addresses = await Address.find({ userId: userId })

            const cart = await Cart.findOne({ userId })
                .populate({
                    path: 'products.productId',
                    populate: { path: 'brand category' }
                });

            if (!cart) {
                return res.render('checkout', { products: [], addresses: addresses ? addresses : [] });
            }

            //calculating subtotal,tax and grandtotal to display in the price details.
            const subtotal = cart.products.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            const tax = (subtotal * 10) / 100;
            const grandTotal = subtotal + tax;

            const products = cart.products.map(item => {
                const product = item.productId;
                const variation = product.variations.filter((vari) => vari._id.toString() === item.variationID.toString())

                return {
                    _id: item._id,//object id of objects in cart
                    productId: item.productId._id,//object id of product in 
                    variationID: item.variationID,
                    productName: product.productName,
                    salePrice: variation[0].salePrice,
                    quantity: item.quantity,//cart added quantity of that product
                    totalPrice: item.totalPrice,
                    productImages: product.productImages,
                    stock: variation[0].quantity,
                    size: variation[0].size
                };
            });


            res.render('checkout', {
                products,
                cart,
                tax,
                grandTotal,
                addresses: addresses ? addresses : []
            });

        } else {
            res.redirect("/login")
        }

    } catch (error) {
        console.error('Error while loading checkout page:', error);
        res.redirect("/pageNotfound")
    }
}

const placeOrder = async (req, res) => {
    try {
        const {
            orderedItems,
            subtotal,
            tax,
            totalPrice,
            selectedAddressId,
            paymentMethod
        } = req.body;


        const address = await Address.findById(selectedAddressId);

        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }

        const newOrder = new Order({
            userId:req.session.user,
            orderedItems: orderedItems.map(item => ({
                product: item.productId,
                quantity: item.quantity,
                size:item.productSize,
                price: item.price,
                variationID: item.variationID
            })),
            subtotal: subtotal,
            tax: tax,
            discount: 0,
            finalAmount: subtotal + tax,
            address: {
                addressType: address.addressType,
                name: address.name,
                locality: address.locality,
                city: address.city,
                landMark: address.landMark,
                state: address.state,
                pincode: address.pincode,
                phone: address.phone,
                altPhone: address.altPhone
            },
            paymentMethod,
            orderStatus: 'Processing',
            couponApplied: false
        });

        await newOrder.save();

        for (const item of orderedItems) {
            const product = await Product.findById(item.productId);

            if (product) {
                const variation = product.variations.find(v => v._id.toString() === item.variationID);
                if (variation) {
                    variation.quantity -= item.quantity;

                    if (variation.quantity < 0) {
                        return errorResponse(res, null, `Not enough stock for ${product.productName}`);
                    }
                } else {
                    return errorResponse(res, null, `Variation not found for product ${product.productName}`);
                }

                await product.save();
            } else {
                return errorResponse(res, null, 'Product not found');
            }
        }

        await Cart.deleteOne({ userId: req.session.user });



        successResponse(res, { orderId: newOrder._id }, 'Order placed successfully');
    } catch (error) {
        console.error('Error placing order:', error);
        errorResponse(res, error, 'Failed to place order');
    }
}





module.exports = {
    loadCheckoutPage,
    placeOrder

}