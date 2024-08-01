const express = require('express')
const adminRouter = express.Router();
const {userAuth,adminAuth} = require('../middlewares/authentication');
const adminController=require('../controllers/AdminController')
const upload = require('../middlewares/multer')


adminRouter.get('/pageerror',adminController.pageerror)

adminRouter.get('/login',adminController.loadAdminLogin)
adminRouter.post('/admin-login',adminController.adminLogin) 
adminRouter.get('/',adminAuth,adminController.loadDashboard) 
adminRouter.get('/logoutadmin',adminAuth,adminController.adminLogout)







//forgot password &&change password
adminRouter.get('/forgotPassword',adminController.loadForgotPassword)
adminRouter.post('/sendOtpToChangePassword',adminController.sendOtpToChangePassword)
adminRouter.get('/loadChangePasswordPage',adminController.loadChangePasswordPage)

 
 

//admin homepage  //display all users 
adminRouter.get('/dashboard', adminAuth,adminController.loadDashboard)


adminRouter.get('/add_users',adminAuth,adminController.loadAddUserPage)
//insert new user into db
adminRouter.post('/add_new', upload,adminAuth,adminController.addNewUser);
//--------edit User  page
adminRouter.get('/edit/:id',adminAuth, adminController.loadEditUserPage)
//edit-user-route-----
adminRouter.post('/update/:id', upload,adminAuth, adminController.editUser)
//delete user-route
adminRouter.get('/delete/:id',adminAuth, adminController.deleteUser)



// adminRouter.get('*', (req, res) => {
//     res.render('admin/404')
// })

module.exports = adminRouter; 