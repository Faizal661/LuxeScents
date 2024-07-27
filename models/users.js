const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,

    },
    phone: {
        type: String,

    },
    password: {
        type: String,
        required: true
    },
    is_blocked: {
        type: Number,
    },
    address: [{
        fullName: { type: String },
        number: { type: Number },
        house: { type: String },
        street: { type: String },
        landMark: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: Number },
        isActive: { type: Boolean, default: false }
    }],
    created: {
        type: Date,
        required: true,
        default: Date.now
    }

});

//hashing password
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};


module.exports = mongoose.model('User', userSchema)