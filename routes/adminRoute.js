import { Router } from 'express'
const adminRouter = Router();

import { adminAuth } from '../middlewares/authentication.js'

import * as adminController from '../controllers/admin/adminController.js'
import * as customerController from '../controllers/admin/customerController.js'
import * as categoryController from '../controllers/admin/categoryController.js'
import * as productController from '../controllers/admin/productController.js'
import * as orderController from '../controllers/admin/orderController.js'
import * as offerController from '../controllers/admin/offerController.js'
import * as couponController from '../controllers/admin/couponController.js'
import * as salesReportController from '../controllers/admin/salesReportController.js'


//authentication
adminRouter.get('/login', adminController.loadAdminLogin)
adminRouter.post('/admin-login', adminController.adminLogin)
adminRouter.get('/logoutadmin', adminAuth, adminController.adminLogout)

//Dashboard
adminRouter.get('/dashboard', adminAuth, adminController.loadDashboard)
adminRouter.get('/', adminAuth, adminController.loadDashboard)

//salesReport 
adminRouter.get('/salesReport', adminAuth, salesReportController.loadSalesReportPage)
adminRouter.get('/salesReport/excel', adminAuth, salesReportController.downloadSalesReportExcel);
adminRouter.get('/salesReport/pdf', adminAuth, salesReportController.downloadSalesReportPDF);

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

//orders
adminRouter.get('/orders', adminAuth, orderController.orderInfo)
adminRouter.get('/orderDetails', adminAuth, orderController.orderDetails)
adminRouter.post('/updateOrderStatus', adminAuth, orderController.updateOrderStatus)

//product offers
adminRouter.get('/productOffers', adminAuth, offerController.loadProductOffers)
adminRouter.get('/loadAddProductOfferPage', adminAuth, offerController.loadAddProductOfferPage)
adminRouter.post('/addProductOffer', adminAuth, offerController.addProductOffer)
adminRouter.post('/toggleProductOffer/:id', adminAuth, offerController.toggleProductOffer)
adminRouter.delete('/deleteProductOffer/:id', adminAuth, offerController.deleteProductOffer)

//category offers
adminRouter.get('/categoryOffers', adminAuth, offerController.loadCategoryOffers)
adminRouter.get('/loadAddCategoryOfferPage', adminAuth, offerController.loadAddCategoryOfferPage)
adminRouter.post('/addCategoryOffer', adminAuth, offerController.addCategoryOffer)
adminRouter.post('/toggleCategoryOffer/:id', adminAuth, offerController.toggleCategoryOffer)
adminRouter.delete('/deleteCategoryOffer/:id', adminAuth, offerController.deleteCategoryOffer)

//coupon management
adminRouter.get('/coupons', adminAuth, couponController.loadCouponListingPage)
adminRouter.get('/addCoupon', adminAuth, couponController.loadAddCouponPage)
adminRouter.post('/addCoupon', adminAuth, couponController.addCoupon)
adminRouter.patch('/toggleCoupon/:couponId', couponController.toggleCouponStatus);


//page error
adminRouter.get('/pageError', adminAuth, adminController.pageError)
adminRouter.get('*', adminController.pageError)

export default adminRouter;