const express = require('express')
const adminRouter = express.Router();
const { adminAuth } = require('../middlewares/authentication');
const adminController = require('../controllers/adminController')
const customerController = require('../controllers/customerController')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')

adminRouter.get('/pageerror', adminAuth, adminController.pageerror)

adminRouter.get('/login', adminController.loadAdminLogin)
adminRouter.post('/admin-login', adminController.adminLogin)
adminRouter.get('/dashboard', adminAuth, adminController.loadDashboard)
adminRouter.get('/', adminAuth, adminController.loadDashboard)
adminRouter.get('/logoutadmin', adminAuth, adminController.adminLogout)

//users
adminRouter.get('/users', adminAuth, customerController.customerInfo)
adminRouter.get('/blockCustomer', adminAuth, customerController.toggleCustomerBlocking)
adminRouter.get('/unblockCustomer', adminAuth, customerController.toggleCustomerBlocking)

//category
adminRouter.get('/category', adminAuth, categoryController.categoryInfo)
adminRouter.post('/addCategory', adminAuth, categoryController.addCategory)
adminRouter.get('/editCategory', adminAuth, categoryController.getEditCategory)
adminRouter.post('/editCategory/:id', adminAuth, categoryController.EditCategory)
adminRouter.get('/unlistCategory', adminAuth, categoryController.toggleCategoryListing)
adminRouter.get('/listCategory', adminAuth, categoryController.toggleCategoryListing)


//product
adminRouter.get('/products', adminAuth, productController.productInfo)
adminRouter.get('/blockProduct', adminAuth, productController.toggleProductListing)
adminRouter.get('/unblockProduct', adminAuth, productController.toggleProductListing)
adminRouter.get('/addProduct', adminAuth, productController.getAddProduct)
adminRouter.post('/addProduct', adminAuth, productController.addProduct)
adminRouter.get('/editProduct/:id', adminAuth, productController.getEditProduct)
adminRouter.post('/editProduct/:id', adminAuth, productController.editProduct)


//page error
adminRouter.get('*', adminController.pageerror)

module.exports = adminRouter; 