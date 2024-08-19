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
        console.log(name, phone);

        const existingUser = await User.findOne({ name: name, _id: { $ne: userId } });
        console.log(req.session)
        if (existingUser) {

            return res.render('userProfile/editDetails', {
                userName: req.session.userName,
                errorMessage: 'Username is already taken.',
                user: await User.findById(userId)
            });
        }

        await User.findByIdAndUpdate(userId, { name: name, phone: phone });
        req.session.userName=name;
        console.log(req.session)
        res.redirect('/userProfile');

    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).send('Server Error');
    }
};



const loadAddAddressPage = async (req, res) => {
    try {
        const userId = req.session.user;
        if (userId) {
            console.log(userId)
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
        res.redirect('/userProfile');

    } catch (error) {
        console.error('Error adding address:', error);
        res.redirect('/addAddress');
    }
};

module.exports = {
    loadUserProfilePage,
    loadEditUserProfilePage,
    editUserProfile,
    loadAddAddressPage,
    addAddress

}