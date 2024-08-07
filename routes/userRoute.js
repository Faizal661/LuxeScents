var express = require('express')
var userRouter = express.Router();
const userController=require('../controllers/userController')


const { userAuth } = require('../middlewares/authentication');
const upload=require('../middlewares/multer')
const passport=require('passport')
const User = require('../models/userSchema')
var url = require('url')


//------------------------------------- User Page  ------------------------- 
userRouter.get('/',userController.loadLogin)


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
function storeUserIdInSession(req, res) {
    if (req.user) {
        req.session.user = req.user._id;
        req.session.userName=req.user.name;
        res.redirect('/homepage');
    }
    
}
userRouter.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/signup' }),storeUserIdInSession);

userRouter.get('/shoppage',userAuth,userController.loadShopPage )
userRouter.get('/singleProduct',userAuth,userController.loadSingleProduct )

 
 

//---------user homepage 
userRouter.get('/homepage',userAuth,userController.loadHomepage )

//---------user logout
userRouter.get('/logout',userAuth,userController.userLogout)


userRouter.get("/pageNotfound",userController.pageNotfound)

 
//----------------------------------------------------
 
module.exports = userRouter; 