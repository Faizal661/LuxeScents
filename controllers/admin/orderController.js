const User = require('../../models/userSchema')
const Order = require('../../models/orderSchema')
const Product = require('../../models/productSchema')
const Wallet = require('../../models/walletSchema')

const { successResponse, errorResponse } = require('../../helpers/responseHandler')

const orderInfo = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit;
        const orders = await Order.find().sort({ createdAt: -1 }).populate('userId').skip(skip)
            .limit(limit);
        const totalOrders = await Order.countDocuments({})
        const totalPages = Math.ceil(totalOrders / limit);
        res.render('orders/orders', {
            orders,
            currentPage: page,
            totalPages,
        })
    } catch (error) {
        console.error('Error while loading order listing page:', error);
        res.redirect("/admin/pageError")
    }
}

const orderDetails = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const order = await Order.findById(orderId).populate('orderedItems.product');
        if (!order) {
            return res.redirect("/admin/pageError")
        }
        res.render('orders/orderDetailed', {
            order,
        });
    } catch (error) {
        console.error('Error while loading order detail page', error);
        res.redirect("/admin/pageError")
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, newStatus } = req.body;
        const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Request', 'Returned'];
        if (!validStatuses.includes(newStatus)) {
            return errorResponse(res, 'Invalid status', 400);
        }
        const order = await Order.findById(orderId);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }
        order.orderStatus = newStatus;
        if (newStatus === 'Cancelled' || newStatus === 'Returned') {
            for (const item of order.orderedItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    const variation = product.variations.find(v => v._id.toString() === item.variationID);
                    if (variation) {
                        variation.quantity += item.quantity;
                    }
                    await product.save();
                }
            }
            if (order.paymentStatus === 'Paid') {
                let wallet = await Wallet.findOne({ userId: order.userId });
                if (!wallet) {
                    wallet = new Wallet({
                        userId: order.userId,
                        balance: 0,
                        transactions: []
                    });
                }
                wallet.balance += order.finalAmount;
                wallet.transactions.push({
                    amount: order.finalAmount,
                    type: 'credit',
                    orderId: order._id,
                    description: `${newStatus} order amount for Order ID: ${order.orderId}`
                });
                await wallet.save();
            }

        }else if(newStatus==='Delivered'){
            order.paymentStatus='Paid'
        }
        await order.save();
        return successResponse(res, 'Order status updated successfully');
    } catch (error) {
        console.error('Error updating order status:', error);
        res.redirect("/admin/pageError")
    }
};

module.exports = {
    orderInfo,
    updateOrderStatus,
    orderDetails
}