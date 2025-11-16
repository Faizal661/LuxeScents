import User from "../models/userSchema.js"; 

export const userAuth = async (req, res, next) => {
    if (req.session.user) {
        try {
            const data = await User.findById(req.session.user);

            if (data && !data.isBlocked) {
                // User is authenticated and not blocked
                next();
            } else if (data && data.isBlocked) {
                // User is blocked, destroy session and redirect
                req.session.destroy((err) => {
                    if (err) {
                        console.log("Session destruction error", err.message);
                        return res.redirect("/pageNotfound");
                    }
                    return res.redirect('/login?blocked');
                });
            } else {
                // User ID in session doesn't match a user (deleted user)
                res.redirect('/login');
            }
        } catch (error) {
            console.log("Error in user auth middleware", error);
            res.redirect("/pageNotfound");
        }
    } else {
        // No user ID in session
        res.redirect('/login');
    }
};

export const adminAuth = async (req, res, next) => {
    if (req.session.admin) {
        try {            
            const data = await User.findOne({ isAdmin: true });

            if (data) {
                res.locals.adminName = req.session.adminName;
                next();
            } else {
                res.redirect('/admin/login');
            }
        } catch (error) {
            console.log("Error in adminauth middleware", error);
            res.status(500).send("Internal Server error");
        }
    } else {
        res.redirect('/admin/login');
    }
};