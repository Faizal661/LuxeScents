const express = require('express')
const adminRouter = express.Router();
const {userAuth,adminAuth} = require('../middlewares/authentication');
const adminController=require('../controllers/adminController')
const customerController=require('../controllers/customerController')
const categoryController=require('../controllers/categoryController')
const productController=require('../controllers/productController')


// const upload = require('../middlewares/multer')


adminRouter.get('/pageerror',adminController.pageerror)

adminRouter.get('/login',adminController.loadAdminLogin)
adminRouter.post('/admin-login',adminController.adminLogin) 

//admin homepage  
adminRouter.get('/dashboard', adminAuth,adminController.loadDashboard)
adminRouter.get('/',adminAuth,adminController.loadDashboard) 
adminRouter.get('/logoutadmin',adminAuth,adminController.adminLogout)

//users
adminRouter.get('/users',adminAuth,customerController.customerInfo)
adminRouter.get('/blockCustomer',adminAuth,customerController.customerBlocked)
adminRouter.get('/unblockCustomer',adminAuth,customerController.customerunBlocked)

//category
adminRouter.get('/category',adminAuth,categoryController.categoryInfo)
adminRouter.post('/addCategory',adminAuth,categoryController.addCategory)


//product
adminRouter.get('/products',adminAuth,productController.productInfo)
adminRouter.get('/blockProduct',adminAuth,productController.productBlocked)
adminRouter.get('/unblockProduct',adminAuth,productController.productunBlocked)

adminRouter.get('/addProducts',adminAuth,productController.addProducts)
 
  
 





//forgot password &&change password
// adminRouter.get('/forgotPassword',adminController.loadForgotPassword)
// adminRouter.post('/sendOtpToChangePassword',adminController.sendOtpToChangePassword)
// adminRouter.get('/loadChangePasswordPage',adminController.loadChangePasswordPage)









// adminRouter.get('/add_users',adminAuth,adminController.loadAddUserPage)
// //insert new user into db
// adminRouter.post('/add_new', upload,adminAuth,adminController.addNewUser);
// //--------edit User  page
// adminRouter.get('/edit/:id',adminAuth, adminController.loadEditUserPage)
// //edit-user-route-----
// adminRouter.post('/update/:id', upload,adminAuth, adminController.editUser)
// //delete user-route
// adminRouter.get('/delete/:id',adminAuth, adminController.deleteUser)



// adminRouter.get('*', (req, res) => {
//     res.render('admin/404')
// })

module.exports = adminRouter; 