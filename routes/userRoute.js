import { Router } from 'express';
import passport from 'passport';

// --- Controllers ---
import * as userController from '../controllers/user/userController.js';
import * as cartController from '../controllers/user/cartController.js';
import * as checkoutController from '../controllers/user/checkoutController.js';
import * as userProfileController from '../controllers/user/userProfileController.js';
import * as wishlistController from '../controllers/user/wishlistController.js';
import * as OrderController from '../controllers/user/orderController.js';
import * as walletController from '../controllers/user/walletController.js';

// --- Middleware  ---
import { userAuth } from '../middlewares/authentication.js';

const userRouter = Router();


//goole authenticaion routes
userRouter.get('/auth/google/', passport.authenticate('google', { scope: ['profile', 'email'] }));
userRouter.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/signup' }), userController.googleAuthCallback);

//user authentication
userRouter.get('/login', userController.loadLogin);
userRouter.post('/login', userController.userLogin);
userRouter.get('/signup', userController.loadSignup);
userRouter.post('/register_new', userController.registerNew);
userRouter.post('/verify-otp', userController.verifyOtp);
userRouter.post('/resend-otp', userController.resendOtp);

//forgot password
userRouter.get('/forgotPassword', userController.loadForgotPassword);
userRouter.post('/verifyMail', userController.verifyMail);

userRouter.get('/loadOtpVerify', userProfileController.loadOtpVerify);
userRouter.post('/verifyOtpForgotPassword', userProfileController.verifyOtp);
userRouter.post('/resendOtpForgotPassword', userProfileController.resendOtp);
userRouter.get('/loadNewPassword', userProfileController.loadNewPassword);
userRouter.post('/resetPassword', userProfileController.resetPassword);

//user pages
userRouter.get('/', userController.loadHomepage);
userRouter.get('/homepage', userController.loadHomepage);
userRouter.get('/shoppage', userController.loadShopPage);
userRouter.get('/singleProduct', userController.loadSingleProduct);

//userProfile
userRouter.get('/userProfile', userAuth, userProfileController.loadUserProfilePage);
userRouter.get('/loadEditUserProfilePage', userAuth, userProfileController.loadEditUserProfilePage);
userRouter.post('/editUserProfile/:id', userAuth, userProfileController.editUserProfile);

//address management
userRouter.get('/loadAddAddressPage', userAuth, userProfileController.loadAddAddressPage);
userRouter.post('/addAddress/:id', userAuth, userProfileController.addAddress);
userRouter.get('/loadEditAddressPage', userAuth, userProfileController.loadEditAddressPage);
userRouter.post('/editAddress/:id', userAuth, userProfileController.editAddress);
userRouter.delete('/deleteAddress/:id', userAuth, userProfileController.deleteAddress);

// change password
userRouter.get('/loadChangePassword', userAuth, userProfileController.loadChangePassword);
userRouter.post('/changePassword', userAuth, userProfileController.changePassword);

//wishlist
userRouter.get('/loadWishlistPage', userAuth, wishlistController.loadWishlist);
userRouter.post('/toggleWishlist', userAuth, wishlistController.toggleWishlist);
userRouter.post('/removeFromWishlist', userAuth, wishlistController.removeFromWishlist);

//cart 
userRouter.get('/loadCartPage', userAuth, cartController.loadCartPage);
userRouter.post('/addProductToCart', userAuth, cartController.addProductToCart);
userRouter.post('/removeFromCart', userAuth, cartController.removeFromCart);
userRouter.post('/updateCartItem', userAuth, cartController.updateCartItem);
userRouter.get('/cartTotal', userAuth, cartController.cartTotal);

//checkout
userRouter.get('/checkoutPage', userAuth, checkoutController.loadCheckoutPage);
userRouter.post('/checkoutPage', userAuth, checkoutController.loadCheckoutPage);
userRouter.patch('/removeCoupon', userAuth, checkoutController.removeCoupon);
userRouter.post('/placeOrder', userAuth, checkoutController.placeOrder);
userRouter.post('/create-razorpay-order', userAuth, checkoutController.createRazorpayOrder);
userRouter.post('/payment-success', checkoutController.handlePaymentSuccess);

//order 
userRouter.get('/orderSuccess', userAuth, OrderController.orderSuccess);
userRouter.get('/orderDetails', userAuth, OrderController.orderDetails);
userRouter.get('/downloadInvoice', userAuth, OrderController.downloadInvoice);
userRouter.post('/cancelOrder', userAuth, OrderController.cancelOrder);
userRouter.post('/returnRequest', userAuth, OrderController.returnRequest);
userRouter.get('/loadOrders', userAuth, OrderController.loadOrders);

//wallet
userRouter.get('/loadWallet', userAuth, walletController.loadWalletPage);

userRouter.get('/logout', userAuth, userController.userLogout);
userRouter.get("/pageNotfound", userController.pageNotfound);


export default userRouter;