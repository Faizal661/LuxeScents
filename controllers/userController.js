const User = require('../models/userSchema')
const nodemailer = require("nodemailer")


//--------------------Log In 

const loadLogin = async (req, res) => {
    try {
        res.render('signin', { title: 'Login page' })
    } catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
    }
}

const loadForgotPassword = async (req, res) => {
    try {
        res.render('forgotPassword', { title: 'forgot password' })
    } catch (error) {
        console.log(error,'page not found');
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
        console.log(error,'page not found');
        res.status(500).send("server error")
    }
}

const loadChangePasswordPage = async (req, res) => {
    try {
        // res.send('dsafg')
        res.render('changePassword', { title: 'change password' })
    } catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
    }
}

//------------------sign Up

const loadSignup = async (req, res) => {
    try {
        res.render('signup', { title: 'signUp page' })
    } catch (error) {
        console.log(error,'Sign up page not found');
        res.status(500).send("server error")
    }
}

const loadSignUpOtpPage=async (req, res) => {
    try {
        res.render('signupOtpConfirm', { title: 'signUp page' })
    } catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
    }
}

function generateOtp(){
    return Math.floor(100000+Math.random()*900000).toString();
}

async function sendVerificationEmail(email,otp){
    try {
        const transporter=nodemailer.createTransport({
            service:'gmail',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:"mohammedfaizal.t.bca.2@gmail.com",
                pass:"uzsd xbey dlox ehbx"
            }
        })

        const info = await transporter.sendMail({
            from :"mohammedfaizal.t.bca.2@gmail.com",
            to:email,
            subject:"Verify your account",
            text : `Your OTP is ${otp}`,
            html:`<b> Your OTP : ${otp} </b>`
        })

        return info.accepted.length > 0

    } catch (error) {
        console.error("Error sending email",error);
        return false;
    }
}

const registerNew = async (req, res) => {
    // const name= req.body.username;
    // const phone= req.body.phone; 
    

    try {
        const {email,name}=req.body

        //Checking the entered name and email is already is in db.
        const findUser = await User.findOne({ name:name  });
        if (findUser) {
            return res.render("signup",{message:"User name already taken"})
        }
        const findEmail = await User.findOne({ email: email });
        if(findEmail){
            return res.render("signup",{message:"User with this Email already exist"})
        }

        const  otp= generateOtp();
        const emailSent = await sendVerificationEmail(email,otp);

        if(!emailSent){
            return res.json("email-error")
        }

        req.session.userOtp= otp;
        req.session.userData={email,name};


        //render otp entering page
      // res.render('signupOtpConfirm')
        console.log('OTP Sent',otp);



        //saving userdata into db
        // const newUser = new User({name,email,phone,password});

        // console.log(newUser);
        // newUser.save()
        //     .then(() => {
        //         // res.redirect('/signUpOtpConfirm')
        //         res.redirect('/login?newuser')
        //     })
        //     .catch((err) => {
        //         console.log(err)
        //         res.redirect('/login');
        //     });
    } catch (error) {
        console.log(error,'signup error');
        res.render('404')
    }
}

 


//---------------------


const userLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        //console.log(username,password);
        const user = await User.findOne({ email: username });
        //console.log(user);
        if (user && await user.isValidPassword(password)) {
            req.session.userId = user._id;
            return res.redirect('/homepage');
        } else {
            res.redirect('/?invalid')
        }
    } catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
    }

}

const loadHomepage = async (req, res) => {
    try {
        if (req.session.userId) {
            const user = await User.findOne({ _id: req.session.userId });
            console.log(user);
            res.render('homepage')
            // res.render('dashboard', { user: user.name, email: user.email, phone: user.phone, image: user.image })
        } else {
            res.render('homepage')
            // res.render('dashboard', { msg: "Unauthorized User" })
        }
    } catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
    }
}

const userLogout = async (req, res) => {
    try {
        req.session.destroy(function (err) {
            if (err) {
                console.log(err)
                res.send("Error")
            } else {
                // res.render('signin',{logout:"logout successfully...!"}) 
                res.redirect('/?logout')
            }
        })

    } catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
    }
}



const pageNotfound = async (req, res) => {
    try {
        res.render('404')
    }
    catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
    }
}

module.exports = {
    loadLogin,
    loadForgotPassword,
    sendOtpToChangePassword,
    loadChangePasswordPage,
    loadSignup,
    loadSignUpOtpPage,
    registerNew,
    userLogin,
    loadHomepage,
    userLogout,
    pageNotfound,

} 