import Coupon from '../../models/couponSchema.js'
import { successResponse, errorResponse } from '../../helpers/responseHandler.js'
import { RESPONSE_MESSAGE } from "../../constants/responseMessage.constants.js"

export const loadCouponListingPage = async (req, res) => {
    try {
        let search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;
        const coupons = await Coupon.find({ code: { $regex: ".*" + search + ".*", $options: "i" } }).sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const totalCoupons = await Coupon.countDocuments({ code: { $regex: ".*" + search + ".*", $options: "i" } })
        const totalPages = Math.ceil(totalCoupons / limit);

        res.render('coupon/coupons',
            {
                coupons,
                currentPage: page,
                totalPages,
                totalCoupons,
                limit
            });
    } catch (error) {
        console.error('Error loading coupon listing page:', err);
        res.redirect("/admin/pageError")
    }
};

export const loadAddCouponPage = async (req, res) => {
    try {
        res.render('coupon/addCouponPage', {});
    } catch (error) {
        console.error('Error loading addCoupon page:', err);
        res.redirect("/admin/pageError")
    }
};

export const addCoupon = async (req, res) => {
    try {
        const { code, expireOn, offerPrice, minimumPrice } = req.body;

        const existingCoupon = await Coupon.findOne({ code: { $regex: new RegExp(`^${code}$`, 'i') } });
        if (existingCoupon) {
            return errorResponse(res, {}, RESPONSE_MESSAGE.COUPON_ALREADY_EXISTS, 400)
        }

        const newCoupon = new Coupon({
            code,
            expireOn,
            offerPrice,
            minimumPrice
        });

        await newCoupon.save();
        return successResponse(res, {}, RESPONSE_MESSAGE.COUPON_CREATED, 201)
    } catch (error) {
        console.error('Error adding coupon:', error);
        return errorResponse(res, {}, RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR)
    }
};


export const toggleCouponStatus = async (req, res) => {
    try {
        const { couponId } = req.params;

        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            return res.status(404).send('coupon not found');
        }
        coupon.isActive = !coupon.isActive;
        await coupon.save();
        successResponse(res, {}, `Coupon has been ${coupon.isActive ? 'activated' : 'deactivated'}`)

    } catch (err) {
        console.error('Error toggling coupon status:', err);
        res.redirect("/admin/pageError")
    }
};

