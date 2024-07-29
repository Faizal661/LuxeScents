const User = require('../models/userSchema')
const Admin = require('../models/adminSchema')
const fs = require('fs');


const loadAdminLogin = async (req, res) => {
    try {
        res.render('admin/admin_login', { title: 'Admin' })
    } catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
    }
}


const adminLogin = async (req, res) => {
    try {
        // console.log('sdfsdfsdf');
        const { adminname, password } = req.body;
        // console.log(username,password);
        const admin = await Admin.findOne({ email: adminname });
        //console.log(admin);
        if (admin && await admin.isValidPassword(password)) {
            req.session.adminId = admin._id;
            //console.log(req.session.adminId, 'working')
            res.redirect('/admin/admin_home');
        } else {
            res.redirect('/admin?invalid')
        }
    } catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
    }
}


const loadForgotPassword = async (req, res) => {
    try {
        res.render('admin/forgotPassword', { title: 'forgot password' })
    } catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
    }
}

const sendOtpToChangePassword = async (req, res) => {
    const email = req.body.email;
    try {
        const admin = await Admin.findOne({ email: email });
        if (admin) {
            res.redirect('/admin/loadChangePasswordPage')
        } else {
            res.redirect('/admin/forgotPassword?invalid')
        }
    } catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
    }
}

const loadChangePasswordPage = async (req, res) => {
    try {
        // res.send('dsafg')
        res.render('admin/changePassword', { title: 'change password' })
    } catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
    }
}

const adminLogout = async (req, res) => {
    try {
        req.session.destroy(function (err) {
            if (err) {
                console.log(err)
                res.send("Error")
            } else {
                // res.render('signin',{logout:"logout successfully...!"}) 
                res.redirect('/admin?logout')
            }
        })
    } catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
    }
}


const loadAdminHomePage = async (req, res) => {
    try {
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
            res.render('admin/404')
        }
    }
    catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
    }
}

const loadAddUserPage = async (req, res) => {
    try {
        res.render('admin/add_users')
    } catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
    }
}


const addNewUser = async (req, res) => {
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
    } catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
    }
}

const loadEditUserPage = async (req, res) => {
    try {
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
    } catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
    }
}

const editUser = async (req, res) => {
    try {
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
    } catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
    }
}

const deleteUser = async (req, res) => {
    try {
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
    } catch (error) {
        console.log(error,'page not found');
        res.status(500).send("server error")
    }
}








module.exports = {
    loadAdminLogin,
    loadForgotPassword,
    sendOtpToChangePassword,
    loadChangePasswordPage,
    adminLogin,
    loadAdminHomePage,
    adminLogout,
    loadAddUserPage,
    addNewUser,
    loadEditUserPage,
    editUser,
    deleteUser
}



