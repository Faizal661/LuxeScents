var express = require('express')
var url = require('url')
var adminRouter = express.Router();
const User = require('../models/users')
const Admin = require('../models/admin')
const multer = require('multer')
const fs = require('fs');
const {adminRequireLogin } = require('../middlewares/authentication');


//---------------------------------------Admin page--------------------------------

adminRouter.get('/', (req, res) => {
    // console.log('asfgd')
    res.render('admin/admin_login')
})

 
//handle admin login

adminRouter.post('/admin_login', async (req, res) => {
    // console.log('sdfsdfsdf');
    const { username, password } = req.body;
    // console.log(username,password);
    const admin = await Admin.findOne({ name: username });
    //console.log(admin);
    if (admin && await admin.isValidPassword(password)) {
        req.session.adminId = admin._id;
         console.log(req.session.adminId)
        return res.redirect('/admin/admin_home');
    } else {
        res.redirect('/admin?invalid')
    }
})

//admin homepage  //display all users 
adminRouter.get('/admin_home', adminRequireLogin, async (req, res) => {
    console.log('kuhgyftg',req.session.adminId);
    if (req.session.adminId) {
        User.find()
        .then((data) => {
            res.render('admin/home', {
                title: 'Home Page',
                users: data,
            })
        })
        .catch(() => {
            res.render('admin/home')
        })
    } else {
        res.render('404')
    }
})


adminRouter.get('/logoutadmin',adminRequireLogin, (req, res) => {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err)
            res.send("Error")
        } else {
            // res.render('signin',{logout:"logout successfully...!"}) 
            res.redirect('/admin?logout')
        }
    })
})


adminRouter.get('/add_users',adminRequireLogin, (req, res) => {
    res.render('admin/add_users')
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



//insert new user into db
adminRouter.post('/add_new', upload,adminRequireLogin, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
        password: req.body.password,
    });

    user.save()
        .then(() => {
            req.session.message = {
                type: 'success',
                message: 'User added successfully!'
            };
            res.redirect('/admin/admin_home');
        })
        .catch((err) => {
            req.session.message = {
                type: 'danger',
                message: err.message
            };
            res.redirect('/admin/admin_home');
        });
});

//--------edit User  page

adminRouter.get('/edit/:id',adminRequireLogin, (req, res) => {
    let id = req.params.id;
    User.findById(id)
        .then(user => {
            if (!user) {
                res.redirect('/admin');
            } else {
                res.render('admin/edit_users', {
                    title: 'Edit User',
                    user: user,
                });
            }
        })
        .catch(err => {
            console.error(err);
            res.redirect('/admin');
        });
})

//edit-user-route-----
adminRouter.post('/update/:id', upload,adminRequireLogin, (req, res) => {
    let id = req.params.id;
    let new_image = '';
    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image);
        } catch (err) {
            console.log(err)
        }
    } else {
        new_image = req.body.old_image;
    }

    const updatedData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image, 
    };

    User.findByIdAndUpdate(id, updatedData, { new: true })
        .then(result => {
            req.session.message = {
                type: 'success',
                message: 'User updated successfully'
            };
            res.redirect('/admin/admin_home');
        })
        .catch(err => {
            res.json({ message: err.message, type: 'danger' });
        });
})



//delete user-route

adminRouter.get('/delete/:id',adminRequireLogin, (req, res) => {
    let id = req.params.id;
    User.findByIdAndDelete(id).exec()
        .then(result => {
            if (result && result.image) {
                return fs.promises.unlink("./uploads/" + result.image)
                    .catch(err => {
                        console.log("Failed to delete image file: ", err);
                    });
            }
        })
        .then(() => {
            req.session.message = {
                type: "info",
                message: "User deleted successfully!",
            };
            res.redirect("/admin/admin_home");
        })
        .catch(err => {
            res.json({ message: err.message });
        });
})

// adminRouter.get('*', (req, res) => {
//     res.render('admin/404')
// })

module.exports = adminRouter;