const User = require('../models/userSchema')
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const fs = require('fs');


const pageerror = async (req, res) => {
    res.render("pageerror")
}



const loadAdminLogin = async (req, res) => {
    try {
        if (req.session.admin) {
            return res.redirect('/admin/dashboard');
        }
        res.render('admin-login', { message: null })
    } catch (error) {
        console.log(error, 'page not found');
        res.status(500).send("server error")
    }
}


const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await User.findOne({ email:email, isAdmin: true });
        if (admin) {
            //compare password
            const passwordMatch = await bcrypt.compare(password, admin.password)
            if (passwordMatch) {
                // console.log('pass match');
                req.session.admin = true;
                return res.redirect('/admin');
            } else {
                console.log('pass not match',admin);
                return res.render("admin-login", { message: "Incorrect Password" })
                
            }
        } else {
            return res.render("admin-login", { message: "Admin not found" })
            //return res.redirect('/admin?invalid')
        }
    } catch (error) {
        console.log(error, 'login error');
        return res.redirect("/pageerror")
    }
}


const loadDashboard = async (req, res) => {

    if (req.session.admin) {
        try {
            res.render("dashboard")
        } catch (error) {
            res.redirect("/admin/login")
        }
    }
} 

const adminLogout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log("Error destroying admin session", err)
                return res.redirect("/pageerror")
            }
            res.redirect('/admin/login?logout')

        })
    } catch (error) {
        console.log(error, 'Error at admin logout');
        res.redirect("/pageerror")    }
}





module.exports = {
    loadAdminLogin,
    adminLogin,
    loadDashboard,
    pageerror,
    adminLogout,


    // loadForgotPassword,
    // sendOtpToChangePassword,
    // loadChangePasswordPage,


    // loadAddUserPage,
    // addNewUser,
    // loadEditUserPage,
    // editUser,
    // deleteUser
}









// const loadForgotPassword = async (req, res) => {
//     try {
//         res.render('forgotPassword', { title: 'forgot password' })
//     } catch (error) {
//         console.log(error, 'page not found');
//         res.status(500).send("server error")
//     }
// }

// const sendOtpToChangePassword = async (req, res) => {
//     const email = req.body.email;
//     try {
//         const admin = await Admin.findOne({ email: email });
//         if (admin) {
//             res.redirect('/admin/loadChangePasswordPage')
//         } else {
//             res.redirect('/admin/forgotPassword?invalid')
//         }
//     } catch (error) {
//         console.log(error, 'page not found');
//         res.status(500).send("server error")
//     }
// }

// const loadChangePasswordPage = async (req, res) => {
//     try {
//         // res.send('dsafg')
//         res.render('changePassword', { title: 'change password' })
//     } catch (error) {
//         console.log(error, 'page not found');
//         res.status(500).send("server error")
//     }
// }





// const loadAddUserPage = async (req, res) => {
//     try {
//         res.render('add_users')
//     } catch (error) {
//         console.log(error, 'page not found');
//         res.status(500).send("server error")
//     }
// }


// const addNewUser = async (req, res) => {
//     try {
//         const user = new User({
//             name: req.body.name,
//             email: req.body.email,
//             phone: req.body.phone,
//             image: req.file.filename,
//             password: req.body.password,
//         });

//         user.save()
//             .then(() => {
//                 req.session.message = {
//                     type: 'success',
//                     message: 'User added successfully!'
//                 };
//                 res.redirect('/admin/dashboard');
//             })
//             .catch((err) => {
//                 req.session.message = {
//                     type: 'danger',
//                     message: err.message
//                 };
//                 res.redirect('/admin/dashboard');
//             });
//     } catch (error) {
//         console.log(error, 'page not found');
//         res.status(500).send("server error")
//     }
// }

// const loadEditUserPage = async (req, res) => {
//     try {
//         let id = req.params.id;
//         User.findById(id)
//             .then(user => {
//                 if (!user) {
//                     res.redirect('/admin');
//                 } else {
//                     res.render('edit_users', {
//                         title: 'Edit User',
//                         user: user,
//                     });
//                 }
//             })
//             .catch(err => {
//                 console.error(err);
//                 res.redirect('/admin');
//             });
//     } catch (error) {
//         console.log(error, 'page not found');
//         res.status(500).send("server error")
//     }
// }

// const editUser = async (req, res) => {
//     try {
//         let id = req.params.id;
//         let new_image = '';
//         if (req.file) {
//             new_image = req.file.filename;
//             try {
//                 fs.unlinkSync('./uploads/' + req.body.old_image);
//             } catch (err) {
//                 console.log(err)
//             }
//         } else {
//             new_image = req.body.old_image;
//         }

//         const updatedData = {
//             name: req.body.name,
//             email: req.body.email,
//             phone: req.body.phone,
//             image: new_image,
//         };

//         User.findByIdAndUpdate(id, updatedData, { new: true })
//             .then(result => {
//                 req.session.message = {
//                     type: 'success',
//                     message: 'User updated successfully'
//                 };
//                 res.redirect('/admin/dashboard');
//             })
//             .catch(err => {
//                 res.json({ message: err.message, type: 'danger' });
//             });
//     } catch (error) {
//         console.log(error, 'page not found');
//         res.status(500).send("server error")
//     }
// }

// const deleteUser = async (req, res) => {
//     try {
//         let id = req.params.id;
//         User.findByIdAndDelete(id).exec()
//             .then(result => {
//                 if (result && result.image) {
//                     return fs.promises.unlink("./uploads/" + result.image)
//                         .catch(err => {
//                             console.log("Failed to delete image file: ", err);
//                         });
//                 }
//             })
//             .then(() => {
//                 req.session.message = {
//                     type: "info",
//                     message: "User deleted successfully!",
//                 };
//                 res.redirect("/admin/dashboard");
//             })
//             .catch(err => {
//                 res.json({ message: err.message });
//             });
//     } catch (error) {
//         console.log(error, 'page not found');
//         res.status(500).send("server error")
//     }
// }












