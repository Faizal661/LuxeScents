const User = require('../../models/userSchema')
const addressSchema = require('../../models/addressSchema')
const bcrypt = require('bcrypt');
const { successResponse, errorResponse } = require('../../helpers/responseHandler')
const { generateOtp, sendVerificationEmail } = require('../../controllers/user/userController')

const loadUserProfilePage = async (req, res) => {
    try {
        const userName = req.session.userName
        const user = await User.findOne({ name: userName })
        if (user) {
            const addresses = await addressSchema.find({ userId: user._id })
            return res.render('userProfile/userProfile', { user, addresses: addresses ? addresses : [] })
        } else {
            res.redirect("/login")
        }
    } catch (error) {
        res.redirect("/pageNotfound")
    }
}

const loadEditUserProfilePage = async (req, res) => {
    try {
        const userId = req.session.user
        const user = await User.findOne({ _id: userId })
        if (user) {
            return res.render('userProfile/editDetails', { user })
        } else {
            res.redirect("/login")
        }
    } catch (error) {
        res.redirect("/pageNotfound")
    }
}


const editUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, phone } = req.body;

        const existingUser = await User.findOne({ name: name, _id: { $ne: userId } });
        if (existingUser) {
            return res.status(400).json({ error: 'Username is already taken.' });
        }

        await User.findByIdAndUpdate(userId, { name: name, phone: phone });
        req.session.userName = name;
        res.status(200).json({ message: 'Profile updated successfully.' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};




const loadAddAddressPage = async (req, res) => {
    try {
        const userId = req.session.user;
        if (userId) {
            res.render('userProfile/addAddress', { userId });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        res.redirect('/pageNotfound');
    }
};


const addAddress = async (req, res) => {
    try {
        const { addressType, name, phone, altPhone, locality, city, state, pincode, landMark, isActive } = req.body;
        const userId = req.params.id;

        if (isActive) {
            await addressSchema.updateMany({ userId }, { $set: { isActive: false } });
        }

        const newAddress = new addressSchema({
            userId,
            addressType,
            name,
            phone,
            altPhone,
            locality,
            city,
            state,
            pincode,
            landMark,
            isActive: isActive ? true : false
        });

        await newAddress.save();
        return successResponse(res, {}, 'Address added successfully!')

    } catch (error) {
        console.error('Error adding address:', error);
        res.redirect('/pageNotfound');
    }
};


const loadEditAddressPage = async (req, res) => {
    try {
        const addressId = req.query.id;
        const address = await addressSchema.findById(addressId);

        if (!address) {
            return res.status(404).send('Address not found');
        }

        res.render('userProfile/editAddress', { address });
    } catch (error) {
        console.error("Error loading edit address page:", error);
        res.redirect('/pageNotfound');
    }
};

const editAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        const userId = req.session.user;
        const { addressType, name, city, landMark, locality, state, pincode, phone, altPhone, isActive } = req.body;
        console.log(req.body)

        const updatedData = {
            addressType,
            name,
            city,
            landMark,
            locality,
            state,
            pincode,
            phone,
            altPhone,
            isActive: isActive ? true : false
        };
        console.log('new Data', updatedData)

        if (updatedData.isActive) {
            await addressSchema.updateMany({ userId: userId, _id: { $ne: addressId } }, { isActive: false });
        }

        const updatedAddress = await addressSchema.findByIdAndUpdate(addressId, updatedData, { new: true });

        if (!updatedAddress) {
            return res.status(404).send('Address not found');
        }

        return successResponse(res, {}, 'Address updated successfully!')

    } catch (error) {
        console.error("Error updating address:", error);
        res.redirect('/pageNotfound');
    }
};


const deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        const userId = req.session.user;

        const deletedAddress = await addressSchema.findOneAndDelete({ _id: addressId, userId: userId });

        if (!deletedAddress) {
            return res.status(404).json({ error: 'Address not found or you do not have permission to delete this address' });
        }
        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error("Error deleting address:", error);
        res.redirect('/pageNotfound');
    }
}



//---------------------------change password-----------

const loadChangePassword = async (req, res) => {
    try {
        res.render('userProfile/changePassword')
    } catch (error) {
        console.log(error, 'Error while loading change password page');
        res.redirect('/pageNotfound');
    }
}


const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.session.user);

        if (!user) {
            return errorResponse(res, {}, 'User not found', 404);
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return errorResponse(res, {}, 'Current password is incorrect', 400);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await user.save()

        return successResponse(res, {}, 'Password updated successfully');
    } catch (error) {
        console.log(error, 'Error while changing password');
        res.redirect('/pageNotfound');
    }
};


//-----------------------Forget Password------------

const loadOtpVerify = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.session.user })
        req.session.email = user.email
        const email = user.email
        const otp = generateOtp();
        const emailSent = await sendVerificationEmail(email, otp);

        if (!emailSent) {
            return res.json("email-error")
        }

        req.session.userOtp = otp;

        res.render('userProfile/verify-otp')
        console.log('OTP Sent', otp);

    } catch (error) {
        console.log(error, 'otp verify page loading error');
        res.redirect('/pageNotfound');
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body
        console.log(otp)
        if (otp === req.session.userOtp) {
            res.json({ success: true, redirectUrl: "/loadNewPassword" })
        } else {
            res.status(400).json({ success: false, message: "Invalid OTP ,Please try again" })
        }
    } catch (error) {
        console.error("Error Verifying OTP", error)
        res.status(500).json({ success: false, message: "An error occured " })
    }
}

const resendOtp = async (req, res) => {
    try {
        // console.log(req.session)
        const email = req.session.email
        if (!email) {
            return res.status(400).json({ success: false, message: "Email not found in session" })
        }
        const otp = generateOtp();
        req.session.userOtp = otp;
        const emailSent = await sendVerificationEmail(email, otp);

        if (emailSent) {
            console.log('Resend OTP :', otp)
            res.status(200).json({ success: true, message: "OTP Resend Successfully" })
        } else {
            res.status(500).json({ success: false, message: "Failed to resend OTP. Please try again." })
        }
    } catch (error) {
        console.error("Error resending otp", error)
        res.status(500).json({ success: false, message: "Internal server error,Please try again" })
    }
}


const loadNewPassword = async (req, res) => {
    try {
        res.render('userProfile/newPassword')
    } catch (error) {
        console.log(error, 'page not found');
        res.redirect('/pageNotfound');
    }
}

const resetPassword=async(req,res)=>{
    const { newPassword } = req.body;

    try {
        const user = await User.findById(req.session.user);

        if (!user) {
            return errorResponse(res, {}, 'User not found', 404);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await user.save()

        return successResponse(res, {}, 'Password updated successfully');
    } catch (error) {
        console.log(error, 'Error while resetting password');
        res.redirect('/pageNotfound');
    }
}





module.exports = {
    loadUserProfilePage,
    loadEditUserProfilePage,
    editUserProfile,

    loadAddAddressPage,
    addAddress,
    loadEditAddressPage,
    editAddress,
    deleteAddress,

    loadChangePassword,
    changePassword,

    loadOtpVerify,
    verifyOtp,
    resendOtp,
    loadNewPassword,
    resetPassword

}