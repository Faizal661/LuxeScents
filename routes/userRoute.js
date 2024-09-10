var express = require('express')
var userRouter = express.Router();
const userController=require('../controllers/user/userController')
const cartController=require('../controllers/user/cartController')
const checkoutController=require('../controllers/user/checkoutController')
const userProfileController=require('../controllers/user/userProfileController')
const wishlistController=require('../controllers/user/wishlistController')
const OrderController=require('../controllers/user/orderController')

const { userAuth } = require('../middlewares/authentication');
const upload=require('../middlewares/multer')
const passport=require('passport')
const User = require('../models/userSchema')
var url = require('url')


userRouter.get('/',userController.loadHomepage) 

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


//user pages
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

// change password
userRouter.get('/loadChangePassword',userAuth,userProfileController.loadChangePassword)
userRouter.post('/changePassword',userAuth,userProfileController.changePassword)

//forgot password
userRouter.get('/loadOtpVerify',userAuth,userProfileController.loadOtpVerify)
userRouter.post('/verifyOtpForgotPassword',userAuth,userProfileController.verifyOtp)
userRouter.post('/resendOtpForgotPassword',userAuth,userProfileController.resendOtp)
userRouter.get('/loadNewPassword',userAuth,userProfileController.loadNewPassword)
userRouter.post('/resetPassword',userAuth,userProfileController.resetPassword)

//wishlist
userRouter.get('/loadWishlistPage',userAuth,wishlistController.loadWishlist)
userRouter.post('/toggleWishlist',userAuth,wishlistController.toggleWishlist)
userRouter.post('/removeFromWishlist',userAuth,wishlistController.removeFromWishlist)

//cart 
userRouter.get('/loadCartPage',userAuth,cartController.loadCartPage )
userRouter.post('/addProductToCart',userAuth,cartController.addProductToCart)
userRouter.post('/removeFromCart',userAuth,cartController.removeFromCart)
userRouter.post('/updateCartItem',userAuth,cartController.updateCartItem)
userRouter.get('/cartTotal',userAuth,cartController.cartTotal )

//checkout
userRouter.get('/checkoutPage',userAuth,checkoutController.loadCheckoutPage)
userRouter.post('/placeOrder',userAuth,checkoutController.placeOrder)
userRouter.post('/create-razorpay-order',userAuth, checkoutController.createRazorpayOrder);
userRouter.post('/payment-success', checkoutController.handlePaymentSuccess);//razorpay successfull payment handling

//order 
userRouter.get('/orderSuccess',userAuth,OrderController.orderSuccess)
userRouter.get('/orderDetails',userAuth,OrderController.orderDetails)
userRouter.post('/cancelOrder',userAuth,OrderController.cancelOrder)
userRouter.post('/returnRequest',userAuth,OrderController.returnRequest)
userRouter.get('/loadOrders',userAuth,OrderController.loadOrders)


userRouter.get('/logout',userAuth,userController.userLogout)
userRouter.get("/pageNotfound",userController.pageNotfound)

 
 
module.exports = userRouter; 