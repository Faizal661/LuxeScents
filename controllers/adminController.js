const User = require('../models/userSchema')
const bcrypt = require("bcrypt")
const { successResponse, errorResponse } = require('../helpers/responseHandler')



const loadAdminLogin = async (req, res) => {
    try {
        if (req.session.admin) {
            return res.redirect('/admin/dashboard');
        }
        res.render('admin-login', { message: null })
    } catch (error) {
        console.log(error, 'page not found');
        errorResponse(res, error, "Internal server error");
    }
}


const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await User.findOne({ email: email, isAdmin: true });
        if (admin) {
            //await is neccessary, if await is removed only the admin email is validating, and it doesnt wait for passwordmatch
            const passwordMatch = await bcrypt.compare(password, admin.password)
            if (passwordMatch) {
                req.session.admin = true;
                req.session.adminName = admin.email
                return res.redirect('/admin/dashboard');
            } else {
                console.error('password is not matching');
                return res.render("admin-login", { message: "Incorrect Password" })
            }
        } else {
            return res.render("admin-login", { message: "Admin not found" })
        }
    } catch (error) {
        console.log(error, 'Admin login error');
        res.redirect("/pageerror")
    }
}


const loadDashboard = async (req, res) => {
    try {
        if (req.session.admin) {
            return res.render("dashboard", { adminName: req.session.adminName })
        }
        res.render('admin-login', { message: null })
    } catch (error) {
        console.log(error, 'Error while loading dashboard');
        res.redirect("/pageerror")
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
        res.redirect("/pageerror")
    }
}



const pageerror = async (req, res) => {
    try {
        res.render('pageerror', { url: req.url,})
    }
    catch (error) {
        res.redirect("/pageerror")
    }
}



module.exports = {
    loadAdminLogin,
    adminLogin,
    loadDashboard,
    pageerror,
    adminLogout
}
