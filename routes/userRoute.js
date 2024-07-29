var express = require('express')
var userRouter = express.Router();
const userController=require('../controllers/userController')


const { requireLogin } = require('../middlewares/authentication');
const upload=require('../middlewares/multer')

const User = require('../models/userSchema')
var url = require('url')




//------------------------------------- User Page  ------------------------- 
//------------ login-get route
userRouter.get('/',userController.loadLogin)
//------------signup-get route
userRouter.get('/signup',userController.loadSignup)


 
//------------signup-post route
userRouter.post('/register_new',userController.registerNew);
userRouter.get('/signUpOtpConfirm',userController.loadSignUpOtpPage)

 
// ---------- user login-post
userRouter.post('/login',userController.userLogin );

userRouter.get('/forgotPassword',userController.loadForgotPassword)
userRouter.post('/sendOtpToChangePassword',userController.sendOtpToChangePassword)
userRouter.get('/loadChangePasswordPage',userController.loadChangePasswordPage)


//---------user homepage 
userRouter.get('/homepage', requireLogin,userController.loadHomepage )

//---------user logout
userRouter.get('/logout', requireLogin,userController.userLogout)


// userRouter.get('*', userController.pageNotfound)
//----------------------------------------------------
 
module.exports = userRouter; 