var express = require('express')
var userRouter = express.Router();
const { requireLogin } = require('../middlewares/authentication');
const userController=require('../controllers/userController')
const upload=require('../middlewares/multer')

const User = require('../models/users')
var url = require('url')




//------------------------------------- User Page  ------------------------- 
//------------ login-get route
userRouter.get('/',userController.loadLogin)
//------------signup-get route
userRouter.get('/signup',userController.loadSignup)


 
//------------signup-post route
userRouter.post('/register_new', upload,userController.registerNew);


// ---------- user login-post
userRouter.post('/login',userController.userLogin );


//---------user homepage 
userRouter.get('/homepage', requireLogin,userController.loadHomepage )

//---------user logout
userRouter.get('/logout', requireLogin,userController.userLogout)


// userRouter.get('*', userController.pageNotfound)
//----------------------------------------------------
 
module.exports = userRouter; 