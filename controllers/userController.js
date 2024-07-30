const User = require('../models/userSchema')



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

const registerNew = async (req, res) => {
    const name= req.body.username;
    const email= req.body.email; 
    const phone= req.body.phone; 
    const password= req.body.password;

    console.log(name,email,phone,password);
    try {
        //Checking the entered name and password is already is in db.
        const name1 = await User.findOne({ name: name });
        const email1 = await User.findOne({ email: email });
       
        if (name1) {
            return res.redirect('/signup?usertTaken')
        }
        if(email1){
            return res.redirect('/signup?emailTaken')
        }

        //saving userdata into db
        const newUser = new User({name,email,phone,password});

        console.log(newUser);
        newUser.save()
            .then(() => {
                // res.redirect('/signUpOtpConfirm')
                res.redirect('/login?newuser')
            })
            .catch((err) => {
                console.log(err)
                res.redirect('/login');
            });
    } catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
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