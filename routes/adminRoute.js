var express = require('express')
var adminRouter = express.Router();
const {adminRequireLogin } = require('../middlewares/authentication');
const adminController=require('../controllers/AdminController')
const upload = require('../middlewares/multer')



adminRouter.get('/',adminController.loadAdminLogin)
//handle admin login
adminRouter.post('/admin_login',adminController.adminLogin) 

//forgot password &&change password
adminRouter.get('/forgotPassword',adminController.loadForgotPassword)
adminRouter.post('/sendOtpToChangePassword',adminController.sendOtpToChangePassword)
adminRouter.get('/loadChangePasswordPage',adminController.loadChangePasswordPage)


 

//admin homepage  //display all users 
adminRouter.get('/admin_home', adminRequireLogin,adminController.loadAdminHomePage)
adminRouter.get('/logoutadmin',adminRequireLogin,adminController.adminLogout)


adminRouter.get('/add_users',adminRequireLogin,adminController.loadAddUserPage)
//insert new user into db
adminRouter.post('/add_new', upload,adminRequireLogin,adminController.addNewUser);
//--------edit User  page
adminRouter.get('/edit/:id',adminRequireLogin, adminController.loadEditUserPage)
//edit-user-route-----
adminRouter.post('/update/:id', upload,adminRequireLogin, adminController.editUser)
//delete user-route
adminRouter.get('/delete/:id',adminRequireLogin, adminController.deleteUser)



adminRouter.get('*', (req, res) => {
    res.render('admin/404')
})

module.exports = adminRouter; 