var express = require('express')
var userRouter = express.Router();
const userController=require('../controllers/user/userController')
const cartController=require('../controllers/user/cartController')
const checkoutController=require('../controllers/user/checkoutController')
const userProfileController=require('../controllers/user/userProfileController')
const wishlistController=require('../controllers/user/wishlistController')

const { userAuth } = require('../middlewares/authentication');
const upload=require('../middlewares/multer')
const passport=require('passport')
const User = require('../models/userSchema')
var url = require('url')


userRouter.get('/',userController.loadLogin) 


userRouter.get('/login',userController.loadLogin)
userRouter.post('/login',userController.userLogin );

userRouter.get('/forgotPassword',userController.loadForgotPassword)
userRouter.post('/sendOtpToChangePassword',userController.sendOtpToChangePassword)
userRouter.get('/loadChangePasswordPage',userController.loadChangePasswordPage)



userRouter.get('/signup',userController.loadSignup)
userRouter.post('/register_new', userController.registerNew);
userRouter.post('/verify-otp',userController.verifyOtp)
userRouter.post('/resend-otp',userController.resendOtp)

 

//goole authenticaion routes
userRouter.get('/auth/google/',passport.authenticate('google',{scope:['profile','email']}));
function storeUserIdInSession(req, res) {
    if (req.user) {
        req.session.user = req.user._id;
        req.session.userName=req.user.name;
        res.redirect('/homepage');
    }} 
userRouter.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/signup' }),storeUserIdInSession);

userRouter.get('/homepage',userController.loadHomepage )
userRouter.get('/shoppage',userController.loadShopPage )
userRouter.get('/singleProduct',userController.loadSingleProduct )
 

//userProfile
userRouter.get('/userProfile',userAuth,userProfileController.loadUserProfilePage)
userRouter.get('/loadEditUserProfilePage',userAuth,userProfileController.loadEditUserProfilePage)
userRouter.post('/editUserProfile/:id',userAuth,userProfileController.editUserProfile)


//address management
userRouter.get('/loadAddAddressPage',userAuth,userProfileController.loadAddAddressPage)
userRouter.post('/addAddress/:id',userAuth,userProfileController.addAddress)
userRouter.get('/loadEditAddressPage',userAuth,userProfileController.loadEditAddressPage)
userRouter.post('/editAddress/:id',userAuth,userProfileController.editAddress)
userRouter.delete('/deleteAddress/:id',userAuth,userProfileController.deleteAddress)

userRouter.get('/loadResetPassword',userAuth,userProfileController.loadResetPassword)
userRouter.get('/loadOtpVerify',userAuth,userProfileController.loadOtpVerify)
userRouter.get('/loadNewPassword',userAuth,userProfileController.loadNewPassword)

//wishlist
userRouter.get('/loadWishlistPage',userAuth,wishlistController.loadWishlist)
userRouter.post('/toggleWishlist',userAuth,wishlistController.toggleWishlist)
userRouter.post('/removeFromWishlist',userAuth,wishlistController.removeFromWishlist)

//cart 
userRouter.get('/loadCartPage',userAuth,cartController.loadCartPage )
userRouter.post('/addProductToCart',userAuth,cartController.addProductToCart)
userRouter.post('/removeFromCart',userAuth,cartController.removeFromCart)



//checkout
userRouter.get('/checkoutPage',userAuth,checkoutController.loadCheckoutPage)

userRouter.get('/orderSuccess',userAuth,checkoutController.orderSuccess)





userRouter.get('/logout',userAuth,userController.userLogout)
userRouter.get("/pageNotfound",userController.pageNotfound)

 
 
module.exports = userRouter; 