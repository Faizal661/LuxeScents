const User = require('../../models/userSchema')
const Product = require('../../models/productSchema')
const Wishlist = require('../../models/wishlistSchema')
const Cart = require('../../models/cartSchema')
const Category = require('../../models/categorySchema')
const Brand = require('../../models/brandSchema')
const nodemailer = require("nodemailer")
const bcrypt = require('bcrypt');
const { successResponse, errorResponse } = require('../../helpers/responseHandler')





//--------------------Log In 

const loadLogin = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.render('authentication/signin', { title: 'Login page' })
        } else {
            res.redirect("/homepage")
        }
    } catch (error) {
        res.redirect("/pageNotfound")
    }
}


const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({ isAdmin: 0, email: email });
        if (!findUser) {
            return res.render("authentication/signin", { message: "User not found" })
        }
        if (findUser.isBlocked) {
            return res.render("authentication/signin", { message: "User is blocked by admin" })
        }

        const passwordMatch = await bcrypt.compare(password, findUser.password)
        if (!passwordMatch) {
            return res.render("authentication/signin", { message: "Incorrect Password" })
        }
        req.session.user = findUser._id;
        req.session.userName = findUser.name
        res.redirect('/homepage');

    } catch (error) {
        console.error('login error', error);
        res.render("authentication/signin", { message: "Login failed ,please try again later" })
    }

}


const loadForgotPassword = async (req, res) => {
    try {
        res.render('userProfile/forgotPassword', { title: 'forgot password' })
    } catch (error) {
        console.log(error, 'page not found');
        errorResponse(res, error, "Internal server error");
    }
}

const sendOtpToChangePassword = async (req, res) => {
    const email = req.body.email;
    try {
        const user = await User.findOne({ email: email });
        if (user) {
            res.redirect('/loadChangePasswordPage')
        } else {
            res.redirect('/forgotPassword?invalid')
        }
    } catch (error) {
        console.log(error, 'page not found');
        errorResponse(res, error, "Internal server error");
    }
}

const loadChangePasswordPage = async (req, res) => {
    try {
        // res.send('dsafg')
        res.render('authentication/changePassword', { title: 'change password' })
    } catch (error) {
        console.log(error, 'page not found');
        errorResponse(res, error, "Internal server error");
    }
}

//------------------sign Up

const loadSignup = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.render('authentication/signup')
        } else {
            res.redirect("/homepage")
        }
    } catch (error) {
        console.log(error, 'Sign up page not found');
        errorResponse(res, error, "Internal server error");
    }
}


function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: "mohammedfaizal.t.bca.2@gmail.com",
                pass: "uzsd xbey dlox ehbx"
            }
        })

        const info = await transporter.sendMail({
            from: "mohammedfaizal.t.bca.2@gmail.com",
            to: email,
            subject: "Verify your account for sign up to Luxe Scent",
            text: `Your OTP is ${otp}`,
            html: `<b> Your OTP : ${otp} </b>`
        })

        return info.accepted.length > 0

    } catch (error) {
        console.error("Error sending email", error);
        return false;
    }
}

const registerNew = async (req, res) => {

    try {
        const { email, username, phone, password } = req.body

        //Checking the entered name and email is already is in db.
        const findUser = await User.findOne({ name: username });
        if (findUser) {
            return res.render("authentication/signup", { message: "User name already taken" })
        }
        const findEmail = await User.findOne({ email: email });
        if (findEmail) {
            return res.render("authentication/signup", { message: "User with this Email already exist" })
        }

        const otp = generateOtp();
        const emailSent = await sendVerificationEmail(email, otp);

        if (!emailSent) {
            return res.json("email-error")
        }

        req.session.userOtp = otp;
        req.session.userData = { email, username, phone, password };
        req.session.userName = username


        //render otp entering page
        res.render('authentication/verify-otp')
        console.log('OTP Sent', otp);


    } catch (error) {
        console.log('signup error', error);
        res.render('404')
    }
}

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;
    } catch (error) {
        console.log('password hashing error', error);
        errorResponse(res, error.message, "Password hashing failed");
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body
        console.log(otp)
        if (otp === req.session.userOtp) {
            const user = req.session.userData

            const passwordHash = await securePassword(user.password)

            //saving userdata into db
            const saveUserData = new User({
                name: user.username,
                email: user.email,
                phone: user.phone,
                password: passwordHash,
            })

            await saveUserData.save()

            // req.session.user = saveUserData._id;
            console.log(req.session);

            res.json({ success: true, redirectUrl: "/login?newuser" })
        } else {
            res.status(400).json({ success: false, message: "Invalid OTP ,Please try again" })
        }
    } catch (error) {
        console.error("Error Verifying OTP", error)
        res.status(500).json({ success: false, message: "An error occured " })
    }
}


const resendOtp = async (req, res) => {
    try {
        const { email } = req.session.userData
        if (!email) {
            return res.status(400).json({ success: false, message: "Email not found in session" })
        }
        const otp = generateOtp();
        req.session.userOtp = otp;
        const emailSent = await sendVerificationEmail(email, otp);

        if (emailSent) {
            console.log('Resend OTP :', otp)
            res.status(200).json({ success: true, message: "OTP Resend Successfully" })
        } else {
            res.status(500).json({ success: false, message: "Failed to resend OTP. Please try again." })
        }
    } catch (error) {
        console.error("Error resending otp", error)
        res.status(500).json({ success: false, message: "Internal server error,Please try again" })
    }
}


const loadHomepage = async (req, res) => {
    try {
        //best seller filter need to change based on the higher ordered products .so it is pending now.
        const bestSellers = await Product.find({ isBlocked: false }).populate({ path: 'category', match: { isListed: true } }).populate('brand');
        const filteredBestSellers = bestSellers.filter(product => product.category);
        const newArrivals = await Product.find({ isBlocked: false }).sort({ createdAt: -1 }).populate({ path: 'category', match: { isListed: true } }).populate('brand');
        const filteredNewArrivals = newArrivals.filter(product => product.category);
        if (req.session.userName) {
            res.render('homepage', { bestSellers: filteredBestSellers, newArrivals: filteredNewArrivals })
        } else {
            return res.render('homepage', { bestSellers: filteredBestSellers, newArrivals: filteredNewArrivals })
        }
    } catch (error) {
        console.log(error, 'Homepage not loading');
        errorResponse(res, error, "Internal server error");
    }
}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


const loadShopPage = async (req, res) => {
    try {
        const userId = req.session.user;

        //pagination
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;

        //sortingggg
        let sort = req.query.sort || 'createdAt';//sorting criteria
        let order = req.query.order === 'desc' ? -1 : 1;//sorting order asc and desc 

        const searchQuery = req.query.search || ''; //search method in product
        const stockFilter = req.query.stock || '';//stock based filter (out of stock,available ,all)
        const categoryFilter = req.query.category || ''; // New category filter
        const brandFilter = req.query.brand || ''; // New brand filter
        const genderFilter = req.query.gender || ''; // New gender filter

        let query = { isBlocked: false };

        if (searchQuery) {
            query.productName = { $regex: searchQuery, $options: 'i' };
        }
        if (stockFilter) {
            query.status = stockFilter;
        }
        if (categoryFilter) {
            query.category = categoryFilter;
        }
        if (brandFilter) {
            query.brand = brandFilter;
        }
        if (genderFilter) {
            query.gender = genderFilter;
        }

        const products = await Product.find(query).populate({ path: 'category', match: { isListed: true } }).populate('brand').sort({ [sort]: order }).skip(skip)
            .limit(limit);



        // Count total products matching the filters for pagination
        const totalProductsCount = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProductsCount / limit);

       

        // Calculate start and end product indexes for display
        const startProduct = skip + 1;
        const endProduct = Math.min(skip + products.length, totalProductsCount);

        const categories = await Category.find({ isListed: true });
        const brands = await Brand.find({});


        const wishlist = await Wishlist.findOne({ userId })
        const wishlistProductIds = wishlist ? wishlist.products.map(item => item.productId.toString()) : []

        const cart = await Cart.findOne({ userId });
        const cartProductIds = cart ? cart.products.map(item => item.productId.toString()) : [];


        res.render('shop', {
            products,
            currentPage: page,
            totalPages,
            totalProductsCount,
            limit,
            sort,
            order: req.query.order || 'asc',
            startProduct,   // Pass start product index to the template
            endProduct,
            searchQuery,
            wishlistProductIds,
            cartProductIds,
            categories, // Pass categories to the template
            brands,     // Pass brands to the template
            stockFilter,
            categoryFilter,  // Pass category filter to EJS
            brandFilter,     // Pass brand filter to EJS
            genderFilter
        })
    } catch (error) {
        console.log(error, 'ShopPage not loading');
        errorResponse(res, error, "Internal server error");
    }
}




//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


const loadSingleProduct = async (req, res) => {
    try {
        const userId = req.session.user
        const ProductID = req.query.id

        const isValidProduct=await Product.findById({_id:ProductID})
        if(!isValidProduct){
            res.redirect('/pageNotfound')
        }

        const relatedProducts = await Product.find().populate('brand').populate('category');
        const singleProduct = await Product.findOne({ _id: ProductID }).populate('brand').populate('category').populate({ path: 'reviews.user', select: 'name' });

        const wishlist = await Wishlist.findOne({ userId })
        const wishlistProductIds = wishlist ? wishlist.products.map(item => item.productId.toString()) : []

        const cart = await Cart.findOne({ userId })
        const cartProductIds = cart ? cart.products.map(item => item.productId.toString()) : [];

        let productQuantityInCart = 0;
        if (cart) {
            // Find the product in the cart
            const cartProduct = cart.products.find(item => item.productId.toString() === ProductID);
            if (cartProduct) {
                productQuantityInCart = cartProduct.quantity; // Get the quantity of the product if it exists
            }
        }

        res.render('singleProduct', { singleProduct, relatedProducts, wishlistProductIds,cartProductIds,  productQuantityInCart })
    } catch (error) {
        console.log(error, 'Product detailed page is not loading');
        errorResponse(res, error, "Internal server error");
    }
}



const userLogout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log("Session destruction error", err.message)
                return res.redirect("/pageNotfound")
            }
            return res.redirect('/login?logout')

        })

    } catch (error) {
        console.log(error, 'Logout error');
        res.redirect("/pageNotfound")
    }
}




const pageNotfound = async (req, res) => {
    try {
        res.render('404', { url: req.url })
    }
    catch (error) {
        console.log(error, 'page not found error');
        res.redirect("/pageNotfound")
    }
}






module.exports = {
    loadLogin,
    userLogin,

    loadForgotPassword,
    sendOtpToChangePassword,
    loadChangePasswordPage,

    loadSignup,
    registerNew,
    // loadSignUpOtpPage,
    verifyOtp,
    resendOtp,

    loadHomepage,
    loadShopPage,
    loadSingleProduct,

    userLogout,
    pageNotfound,


    generateOtp,
    sendVerificationEmail

} 