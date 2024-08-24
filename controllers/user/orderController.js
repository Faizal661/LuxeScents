const Product = require('../../models/productSchema')
const { successResponse, errorResponse } = require('../../helpers/responseHandler')
const Order = require('../../models/orderSchema'); 

const placeOrder = async (req, res) => {
    try {
        const { products, finalPrice, selectedAddress, paymentOption } = req.body;

        const newOrder = new Order({
            products,
            finalPrice,
            address: selectedAddress,
            paymentMethod: paymentOption,
            userId: req.session.user
        });

        await newOrder.save();
        res.status(200).json({ success: true, message: 'Order placed successfully!' });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'Failed to place order.' });
    }
};


module.exports={
    placeOrder
}