var express = require('express')
var userRouter = express.Router();
const userController=require('../controllers/userController')


const { userAuth } = require('../middlewares/authentication');
const upload=require('../middlewares/multer')
const passport=require('passport')
const User = require('../models/userSchema')
var url = require('url')


userRouter.get("/pageNotfound",userController.pageNotfound)

//------------------------------------- User Page  ------------------------- 
userRouter.get('/',userController.loadHomepage)


//------------ login-get route
userRouter.get('/login',userController.loadLogin)
userRouter.post('/login',userController.userLogin );

userRouter.get('/forgotPassword',userController.loadForgotPassword)
userRouter.post('/sendOtpToChangePassword',userController.sendOtpToChangePassword)
userRouter.get('/loadChangePasswordPage',userController.loadChangePasswordPage)
//,,,,,,,,,,,,



//------------signup-get route
userRouter.get('/signup',userController.loadSignup)
//------------signup-post route
userRouter.post('/register_new', userController.registerNew);
//userRouter.get('/signUpOtpConfirm',userController.loadSignUpOtpPage)
userRouter.post('/verify-otp',userController.verifyOtp)
userRouter.post('/resend-otp',userController.resendOtp)


//goole authenticaion routes
userRouter.get('/auth/google/',passport.authenticate('google',{scope:['profile','email']}));
userRouter.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
    res.redirect('/')
})

userRouter.get('/shoppage',userController.loadShopPage )
userRouter.get('/singleProduct',userController.loadSingleProduct )




//---------user homepage 
userRouter.get('/homepage',userController.loadHomepage )

//---------user logout
userRouter.get('/logout',userController.userLogout)


// userRouter.get('*', userController.pageNotfound)
//----------------------------------------------------
 
module.exports = userRouter; 