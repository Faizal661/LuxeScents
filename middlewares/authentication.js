const User = require('../models/users');
const Admin = require('../models/admin');

// Middleware to protect userId routes
function requireLogin(req, res, next) {
    if (!req.session.userId) {
        res.redirect('/');
    } else {
        next();
    }
}

// Middleware to protect adminId routes
function adminRequireLogin(req, res, next) {
    if (!req.session.adminId) {
        res.redirect('/admin');
    } else {
        next();
    }
}

module.exports = {
    requireLogin,
    adminRequireLogin
};