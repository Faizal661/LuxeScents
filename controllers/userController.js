const User = require('../models/users')




const loadLogin = async (req, res) => {
    try {
        res.render('users/signin', { title: 'Login page' })
    } catch (error) {
        console.log(error.message);
    }
}

const loadSignup = async (req, res) => {
    try {
        res.render('users/signup', { title: 'signUp page' })
    } catch (error) {
        console.log(error.message);
    }
}

const registerNew = async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
            password: req.body.password,
        });

        user.save()
            .then(() => {
                res.redirect('/?newuser')
            })
            .catch((err) => {
                console.log(err)
                res.redirect('/');
            });
    } catch (error) {
        console.log(error.message);
    }
}

const userLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        //console.log(username,password);
        const user = await User.findOne({ name: username });
        //console.log(user);
        if (user && await user.isValidPassword(password)) {
            req.session.userId = user._id;
            return res.redirect('/homepage');
        } else {
            res.redirect('/?invalid')
        }
    } catch (error) {
        console.log(error.message);
    }

}

const loadHomepage = async (req, res) => {
    try {
        if (req.session.userId) {
            const user = await User.findOne({ _id: req.session.userId });
            console.log(user);
            res.render('users/dashboard', { user: user.name, email: user.email, phone: user.phone, image: user.image })
        } else {
            res.render('users/dashboard', { msg: "Unauthorized User" })
        }
    } catch (error) {
        console.log(error.message)
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
        console.log(error.message);
    }
}







const pageNotfound = async (req, res) => {
    try {
        res.render('users/404')
    }
    catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadLogin,
    loadSignup,
    registerNew,
    userLogin,
    loadHomepage,
    userLogout,
    pageNotfound,

} 