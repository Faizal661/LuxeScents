var express = require('express')
var url = require('url')
var router = express.Router();
const User = require('../models/users')
const multer = require('multer')
const fs = require('fs');
const users = require('../models/users');
const {requireLogin } = require('../middlewares/authentication');


router.get('/', (req, res) => {
   res.render('users/signin', { title: 'Login page' })        

})



//------------------------------------- User Page  ------------------------- 

//------------signup route
router.get('/signup', (req, res) => {
    res.render('users/signup',{title: 'signUp page'})
})


//image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },

})
 
var upload = multer({
    storage: storage,
}).single('image');


router.post('/register_new', upload, (req, res) => {
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
});


// ---------- user login
router.post('/login', async (req, res) => {
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
});


//---------user homepage 
router.get('/homepage', requireLogin, async (req, res) => {
    if (req.session.userId) {
        const user = await User.findOne({ _id: req.session.userId });
        console.log(user);
        res.render('users/dashboard', { user: user.name, email: user.email, phone: user.phone, image: user.image })
    } else {
        res.render('users/dashboard', { msg: "Unauthorized User" })
    }
})

//---------user logout
router.get('/logout', requireLogin, (req, res) => {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err)
            res.send("Error")
        } else {
            // res.render('signin',{logout:"logout successfully...!"}) 
            res.redirect('/?logout')
        }
    })
})



//----------------------------------------------------
router.get('*', (req, res) => {
    res.render('users/404')
})

module.exports = router;