const User = require('../../models/userSchema')
const Order = require('../../models/orderSchema')
const Product=require('../../models/productSchema')
const bcrypt = require("bcrypt")
const moment = require('moment')
const { successResponse, errorResponse } = require('../../helpers/responseHandler')

const loadAdminLogin = async (req, res) => {
    try {
        if (req.session.admin) {
            return res.redirect('/admin/dashboard');
        }
        res.render('admin-login', { message: null })
    } catch (error) {
        console.log(error, 'page not found');
        res.redirect("/admin/pageError")
    }
}


const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await User.findOne({ email: email, isAdmin: true });
        if (admin) {
            //* await is neccessary, if await is removed only the admin email is validating, and it doesnt wait for passwordmatch
            const passwordMatch = await bcrypt.compare(password, admin.password)
            if (passwordMatch) {
                req.session.admin = true;
                req.session.adminName = admin.email
                return res.redirect('/admin/dashboard');
            } else {
                console.error('password is not matching');
                return res.render("admin-login", { message: "Incorrect Password" })
            }
        } else {
            return res.render("admin-login", { message: "Admin not found" })
        }
    } catch (error) {
        console.log(error, 'Admin login error');
        res.redirect("/admin/pageError")
    }
}


const loadDashboard = async (req, res) => {
    try {
        let filter = {};
        const filterType = req.query.filterType || 'yearly';
        const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
        switch (filterType) {
            case 'daily':
                filter.createdAt = {
                    $gte: moment().startOf('day').toDate(),
                    $lt: moment().endOf('day').toDate(),
                };
                break;
            case 'weekly':
                filter.createdAt = {
                    $gte: moment().startOf('week').toDate(),
                    $lt: moment().endOf('week').toDate(),
                };
                break;
            case 'yearly':
                filter.createdAt = {
                    $gte: moment().startOf('year').toDate(),
                    $lt: moment().endOf('year').toDate(),
                };
                break;
            case 'custom':
                if (startDate && endDate) {
                    filter.createdAt = {
                        $gte: startDate,
                        $lt: endDate,
                    };
                }
                break;
            default:
                break;
        }
        //~~~~~~~~~    graph data for pie,single line ,poalr Area graphs   ~~~~~~~~~~~//
        const overallOrderAmount = await Order.aggregate([
            { $match: filter }, { $group: { _id: null, totalAmount: { $sum: "$finalAmount" } } }]);
        const overallDiscount = await Order.aggregate([
            { $match: filter }, { $group: { _id: null, totalDiscount: { $sum: "$discount" } } }]);
        const totalAmount = overallOrderAmount.length > 0 ? overallOrderAmount[0].totalAmount : 0;
        const totalDiscount = overallDiscount.length > 0 ? overallDiscount[0].totalDiscount : 0;
        const salesReport = await Order.find(filter)
        const salesCount = await Order.countDocuments(filter);

        const orderStatusCounts = await Order.aggregate([
            { $match: filter },
            { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
        ]);
        const orderStatusMap = {
            Processing: 0,
            Shipped: 0,
            Delivered: 0,
            Cancelled: 0,
            'Return Request': 0,
            Returned: 0
        };
        orderStatusCounts.forEach(status => {
            orderStatusMap[status._id] = status.count;
        });

        //~~~~~~~~~~~~     top selling product ,category and brand       ~~~~~~~~~~~//
        // top 5 best-selling products
        const topProducts = await Order.aggregate([
            { $match: filter },
            { $unwind: "$orderedItems" },
            { $group: { _id: "$orderedItems.product", totalSold: { $sum: "$orderedItems.quantity" } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
            { $unwind: "$product" },
            { $project: { productName: "$product.productName", totalSold: 1 } }
        ]);
        // top 5 best-selling categories
        const topCategories = await Order.aggregate([
            { $match: filter },
            { $unwind: "$orderedItems" },
            { $lookup: { from: "products", localField: "orderedItems.product", foreignField: "_id", as: "productDetails" } },
            { $unwind: "$productDetails" },
            { $group: { _id: "$productDetails.category", totalSold: { $sum: "$orderedItems.quantity" } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
            { $unwind: "$category" },
            { $project: { categoryName: "$category.name", totalSold: 1 } }
        ]);
        //  top 5 best-selling brands
        const topBrands = await Order.aggregate([
            { $match: filter },
            { $unwind: "$orderedItems" },
            { $lookup: { from: "products", localField: "orderedItems.product", foreignField: "_id", as: "productDetails" } },
            { $unwind: "$productDetails" },
            { $group: { _id: "$productDetails.brand", totalSold: { $sum: "$orderedItems.quantity" } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            { $lookup: { from: "brands", localField: "_id", foreignField: "_id", as: "brand" } },
            { $unwind: "$brand" },
            { $project: { brandName: "$brand.brandName", totalSold: 1 } }
        ]);

        //~~~~~~~~~~~~~     Low stock productsss         ~~~~~~~~~~~~~~~~~~~//
        const lowStockProducts = await Product.aggregate([
            { $unwind: "$variations" },
            { $match: { "variations.quantity": { $lt: 20 } } },
            { $project: { productName: 1, "variations.size": 1, "variations.quantity": 1 } }
        ]).sort({"variations.quantity": 1});

        res.render('dashboard', {
            salesCount,
            totalAmount,
            totalDiscount,
            salesReport,
            filterType,
            startDate,
            endDate,
            orderStatusMap,
            topProducts,
            topBrands,
            topCategories,
            lowStockProducts
        });
    } catch (error) {
        console.log("Error loading Dashboard", error);
        res.redirect("/admin/pageError")
    }
};

const adminLogout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log("Error destroying admin session", err)
                return res.redirect("/pageError")
            }
            res.redirect('/admin/login?logout')
        })
    } catch (error) {
        console.log(error, 'Error at admin logout');
        res.redirect("/admin/pageError")
    }
}

const pageError = async (req, res) => {
    try {
        // console.log('TRYPageNotFound')
        res.render('pageError') 
    }
    catch (error) {
        // console.log('CATCHPageNotFound')
        res.redirect("/admin/pageError")
    }
}

module.exports = {
    loadAdminLogin,
    adminLogin,
    loadDashboard,
    pageError,
    adminLogout
}
