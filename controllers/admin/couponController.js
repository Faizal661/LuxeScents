const Category = require("../../models/categorySchema")
const Product = require('../../models/productSchema')
const User =require('../../models/userSchema')
const Coupon = require('../../models/couponSchema')
const { successResponse, errorResponse } = require('../../helpers/responseHandler')

const loadCouponListingPage = async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        res.render('coupon/coupons', { coupons }); 
    } catch (error) {
        res.status(500).send('Error loading coupons');
    }
};

const loadAddCouponPage =async (req, res) => {
    try {
        res.render('coupon/addCouponPage', {  }); 
    } catch (error) {
        res.status(500).send('Error loading coupons');
    }
};

const addCoupon = async (req, res) => {
    try {
        const { code, expireOn, usageLimit, offerPrice, minimumPrice } = req.body;

        const newCoupon = new Coupon({
            code,
            expireOn,
            usageLimit,
            offerPrice,
            minimumPrice
        });

        await newCoupon.save();

        res.redirect('/admin/coupons');
    } catch (error) {
        res.status(500).send('Error adding coupon');
    }
};


const toggleCoupon=async


module.exports = {
    loadCouponListingPage,
    loadAddCouponPage,
    addCoupon,
    toggleCoupon,
}