const User = require('../../models/userSchema')
const Product = require('../../models/productSchema')
const Cart = require('../../models/cartSchema')
const Address = require('../../models/addressSchema') 
const Order = require('../../models/orderSchema')
const Coupon = require('../../models/couponSchema')
const Wallet = require('../../models/walletSchema')
const Razorpay = require('razorpay');
require('dotenv').config();
const { successResponse, errorResponse } = require('../../helpers/responseHandler')
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY

});

const loadCheckoutPage = async (req, res) => {
    try {
        if (req.session.user) {
            const userId = req.session.user;
            let { couponCode } = req.body;
            if (couponCode) {
                const coupon = await Coupon.findOne({
                    code: couponCode,
                    expireOn: { $gte: new Date() },
                    isActive: true,
                    usedBy: { $ne: userId },
                });
                if (!coupon) {
                    return res.redirect('/checkoutPage?error=Invalid or expired coupon');
                }
            }

            const addresses = await Address.find({ userId: userId })
            const cart = await Cart.findOne({ userId })
                .populate({
                    path: 'products.productId',
                    populate: { path: 'brand category' }
                });
            if (!cart) {
                return res.render('checkout', { products: [], addresses: addresses ? addresses : [] });
            }
            let totalOfferDiscount = 0;
            const products = cart.products.map(item => {
                const product = item.productId;
                const variation = product.variations.filter((vari) => vari._id.toString() === item.variationID.toString())
                const offerDiscount = (product.offerPercentage * variation[0].salePrice / 100) * item.quantity;
                totalOfferDiscount += offerDiscount;
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
                    size: variation[0].size,
                    offerDiscount: offerDiscount 
                };
            });
            //calculating subtotal,tax and grandtotal to display in the price details.
            const subtotal = cart.products.reduce((sum, item) => sum + (item.quantity * item.price), 0) - totalOfferDiscount;
            const tax = (subtotal * 10) / 100;
            const grandTotal = subtotal + tax;
            let newGrandTotal = grandTotal
            let discountApplied = false
            let couponDiscount = 0
            if (couponCode) {
                const coupon = await Coupon.findOne({
                    code: couponCode, 
                    expireOn: { $gte: new Date() },
                    isActive: true,
                    usedBy: { $ne: userId },
                });
                if (!coupon) { 
                    return res.redirect('/checkoutPage?error=Invalid or expired coupon');
                }

                if (grandTotal < coupon.minimumPrice) {
                    return res.redirect('/checkoutPage?error=Total price is less than coupon minimum price');
                }
                couponDiscount = coupon.offerPrice;
                newGrandTotal -= couponDiscount; 
                coupon.usedBy.push(userId);
                // coupon.usedCount += 1;
                await coupon.save();
                discountApplied = true
            }
            const coupons = await Coupon.find({
                expireOn: { $gte: new Date() },
                // usageLimit: { $gt: usedCount }, 
                minimumPrice: { $lte: grandTotal },
                isActive: true,
                usedBy: { $ne: userId }
            });
            const wallet = await Wallet.findOne({ userId: userId });
            const walletBalance = wallet ? wallet.balance : 0;

            res.render('checkout', {
                products,
                cart,
                tax,
                subtotal,
                grandTotal: newGrandTotal,
                addresses: addresses ? addresses : [],
                totalOfferDiscount,
                coupons,
                couponCode: couponCode,
                couponDiscount,
                discountApplied,
                walletBalance
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
            paymentMethod,
            discount,
            couponApplied,
            couponDiscount
        } = req.body;
        console.log(req.body)
        const address = await Address.findById(selectedAddressId);
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }
        const newOrder = new Order({
            userId: req.session.user,
            orderedItems: orderedItems.map(item => ({
                product: item.productId,
                quantity: item.quantity,
                size: item.productSize,
                price: item.price,
                variationID: item.variationID
            })),
            subtotal: subtotal,
            tax: tax,
            discount: discount,
            finalAmount: totalPrice,
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
            couponApplied,
            couponDiscount
            
        });
        await newOrder.save();
        if (paymentMethod === 'Wallet') {
            newOrder.paymentStatus = 'Paid';
            let wallet = await Wallet.findOne({ userId: newOrder.userId });
            wallet.balance -= newOrder.finalAmount;
            wallet.transactions.push({
                amount: newOrder.finalAmount,
                type: 'debit',
                orderId: newOrder._id,
                description: `Purchased products for Order ID: ${newOrder.orderId}`
            });
            await wallet.save();
        }
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


const createRazorpayOrder = async (req, res) => {
    try {
        const { totalPrice } = req.body;
        const orderOptions = {
            amount: Math.round(totalPrice * 100), // Amount in paise (multiply by 100)
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`,
            payment_capture: 1,
        };
        const razorpayOrder = await razorpay.orders.create(orderOptions);
        res.status(200).json({
            success: true,
            order: razorpayOrder,
            key_id: process.env.RAZORPAY_ID_KEY,
            user: req.session.userName, // Pass user details if needed for prefill
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create Razorpay order',
        });
    }
};


const handlePaymentSuccess = async (req, res) => {
    try {
        const { paymentId, razorpayOrderId, orderId } = req.body;
        const order = await Order.findOne({ _id: orderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }
        order.paymentStatus = 'Paid';
        order.razorpay = {
            paymentId,
            orderId: razorpayOrderId
        };
        await order.save();
        successResponse(res, { orderId: orderId }, 'Order placed successfully');

    } catch (error) {
        console.error('Error handling payment success:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process payment',
        });
    }
};

module.exports = {
    loadCheckoutPage,
    placeOrder,
    createRazorpayOrder,
    handlePaymentSuccess

}