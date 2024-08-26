const User = require('../../models/userSchema')
const addressSchema = require('../../models/addressSchema')
const { successResponse, errorResponse } = require('../../helpers/responseHandler')


const loadUserProfilePage = async (req, res) => {
    try {
        const userName = req.session.userName
        const user = await User.findOne({ name: userName })
        if (user) {
            const addresses = await addressSchema.find({ userId: user._id })
            return res.render('userProfile/userProfile', { userName, user, addresses: addresses ? addresses : [] })
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
            return res.render('userProfile/editDetails', { userName: user.name, user })
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
            res.render('userProfile/addAddress', { userName: req.session.userName, userId });
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
        return successResponse(res,{},'Address added successfully!')

    } catch (error) {
        console.error('Error adding address:', error);
        return errorResponse(res,error,'Error adding address. Please try again.') 
    }
};


const loadEditAddressPage = async (req, res) => {
    try {
        const userName = req.session.userName;
        const addressId = req.query.id;
        const address = await addressSchema.findById(addressId);

        if (!address) {
            return res.status(404).send('Address not found');
        }

        res.render('userProfile/editAddress', { userName, address });
    } catch (error) {
        console.error("Error loading edit address page:", error);
        res.status(500).send('Server Error');
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
        console.log('new Data',updatedData)

        if (updatedData.isActive) {
            await addressSchema.updateMany({ userId: userId, _id: { $ne: addressId } }, { isActive: false });
        }

        const updatedAddress = await addressSchema.findByIdAndUpdate(addressId, updatedData, { new: true });

        if (!updatedAddress) {
            return res.status(404).send('Address not found');
        }

        return successResponse(res,{},'Address updated successfully!')

    } catch (error) {
        console.error("Error updating address:", error);
        return errorResponse(res,error,'Error while updating address. Please try again.') 
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
        res.status(500).json({ error: 'Server Error' });
    }
}


const loadResetPassword = async (req, res) => {
    try {
        res.render('userProfile/resetPassword',{ userName: req.session.userName})
    } catch (error) {
        console.log(error, 'page not found');
        errorResponse(res, error, "Internal server error");
    }
}

// const loadForgotPassword = async (req, res) => {
//     try {
//         res.render('userProfile/forgotPassword', { title: 'forgot password' })
//     } catch (error) {
//         console.log(error, 'page not found');
//         errorResponse(res, error, "Internal server error");
//     } 
// }

const loadOtpVerify = async (req, res) => {
    try {
        res.render('userProfile/verify-otp',{ userName: req.session.userName})
    } catch (error) {
        console.log(error, 'page not found');
        errorResponse(res, error, "Internal server error");
    }
}

const loadNewPassword = async (req, res) => {
    try {
        res.render('userProfile/newPassword',{ userName: req.session.userName})
    } catch (error) {
        console.log(error, 'page not found');
        errorResponse(res, error, "Internal server error");
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

    loadResetPassword,
    // loadForgotPassword,
    loadOtpVerify,
    loadNewPassword

}