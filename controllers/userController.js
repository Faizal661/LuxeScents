const User = require('../models/userSchema')
const nodemailer = require("nodemailer")
const bcrypt = require('bcrypt');





//--------------------Log In 

const loadLogin = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.render('signin', { title: 'Login page' })
        } else {
            res.redirect("/")
        }
    } catch (error) {
        res.redirect("/pageNotfound")
    }
}

//---------------------

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        //console.log(username,password);
        const findUser = await User.findOne({ isAdmin: 0, email: email });
        // console.log(user);
        //no user
        if (!findUser) {
            return res.render("signin", { message: "User not found" })
        }
        //user blocked
        if (findUser.isBlocked) {
            return res.render("signin", { message: "User is blocked by admin" })
        }

        //compare password
        const passwordMatch = await bcrypt.compare(password, findUser.password)
        if (!passwordMatch) {
            return res.render("signin", { message: "Incorrect Password" })
        }

        req.session.user = findUser._id;
        res.redirect('/');


    } catch (error) {
        console.error('login error', error);
        res.render("signin", { message: "Login failed ,please try again later" })
    }

}


const loadForgotPassword = async (req, res) => {
    try {
        res.render('forgotPassword', { title: 'forgot password' })
    } catch (error) {
        console.log(error, 'page not found');
        res.status(500).send("server error")
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
        res.status(500).send("server error")
    }
}

const loadChangePasswordPage = async (req, res) => {
    try {
        // res.send('dsafg')
        res.render('changePassword', { title: 'change password' })
    } catch (error) {
        console.log(error, 'page not found');
        res.status(500).send("server error")
    }
}

//------------------sign Up

const loadSignup = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.render('signup')
        } else {
            res.redirect("/")
        }
    } catch (error) {
        console.log(error, 'Sign up page not found');
        res.status(500).send("server error")
    }
}

// const loadSignUpOtpPage = async (req, res) => {
//     try {
//         res.render('signupOtpConfirm', { title: 'signUp page' })
//     } catch (error) {
//         console.log(error, 'page not found');
//         res.status(500).send("server error")
//     }
// }

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
            return res.render("signup", { message: "User name already taken" })
        }
        const findEmail = await User.findOne({ email: email });
        if (findEmail) {
            return res.render("signup", { message: "User with this Email already exist" })
        }

        const otp = generateOtp();
        const emailSent = await sendVerificationEmail(email, otp);

        if (!emailSent) {
            return res.json("email-error")
        }

        req.session.userOtp = otp;
        req.session.userData = { email, username, phone, password };


        //render otp entering page
        res.render('verify-otp')
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
        res.status(500).json({ success: false, message: "An error occured " })
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

            req.session.user = saveUserData._id;

            res.json({ success: true, redirectUrl: "/" })
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
        const user = req.session.user;
        if (user) {
            const userData = await User.findOne({ _id: user });
            console.log(userData);
            res.render('homepage', { user: userData })
            // res.render('dashboard', { user: user.name, email: user.email, phone: user.phone, image: user.image })
        } else {
            return res.render('homepage')
            // res.render('dashboard', { msg: "Unauthorized User" })
        }
    } catch (error) {
        console.log(error, 'Homepage not loading');
        res.status(500).send("server error")
    }
}


const loadShopPage=async(req,res)=>{
    try {
        // console.log('sadfsdfas');
            res.render('shop')
            // res.render('dashboard', { user: user.name, email: user.email, phone: user.phone, image: user.image })
       
    } catch (error) {
        console.log(error, 'ShopPage not loading');
        res.status(500).send("server error")
    }
}

const loadSingleProduct=async(req,res)=>{
    try {
            res.render('singleProduct')
            // res.render('dashboard', { user: user.name, email: user.email, phone: user.phone, image: user.image })
       
    } catch (error) {
        console.log(error, 'Product detailed page is not loading');
        res.status(500).send("server error")
    }
}



const userLogout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log("Session destruction error", err.message)
                return res.redirect("/pageNotfound")
            }
            // res.render('signin',{logout:"logout successfully...!"}) 
            return res.redirect('/login?logout')

        })

    } catch (error) {
        console.log(error, 'Logout error');
        res.redirect("/pageNotfound")
    }
}




const pageNotfound = async (req, res) => {
    try {
        res.render('404')
    }
    catch (error) {
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

} 