const Product = require('../../models/productSchema')
const { successResponse, errorResponse } = require('../../helpers/responseHandler')
const Order = require('../../models/orderSchema');

const orderSuccess = async (req, res) => {
    try {
        const orderId = req.query.orderId
        res.render('orderSuccess', { orderId })
    } catch (error) {
        console.error('Error while loading order Success page', error);
        res.redirect("/pageNotfound")
    }
};

const orderDetails = async (req, res) => {
    try {
        const orderId = req.query.orderId;

        const order = await Order.findById(orderId).populate('orderedItems.product'); 
        // console.log('aaaaaaaa',order)

        if (!order) {
            return res.redirect("/pageNotFound");
        }

        res.render('orderDetails', {
            order,
        });
    } catch (error) {
        console.error('Error while loading order detail page', error);
        res.redirect("/pageNotFound");
    }
};


const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);

        if (!order) {
            return errorResponse(res, error, 'Order not found', 404);
        }

        if (order.orderStatus === 'Cancelled') {
            return errorResponse(res, error, 'Order is already cancelled', 400);
        }

        order.orderStatus = 'Cancelled';
        await order.save();

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

        return successResponse(res, {}, 'Order cancelled successfully');
    } catch (error) {
        console.error('Error while cancelling order:', error);
        return errorResponse(res, error, 'Failed to cancel order', 500);
    }
};


const loadOrders=async(req,res)=>{
    try {
        const userId = req.session.user; 
        
        const orders = await Order.find({ userId }).sort({ createdAt: -1 }); 

        res.render('orders', { orders });
    } catch (error) {
        console.error('Error loading orders:', error);
        res.status(500).send('Error loading orders');
    }
};




module.exports = {
    orderSuccess,
    orderDetails,
    cancelOrder,
    loadOrders
}