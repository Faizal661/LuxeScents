const User = require('../../models/userSchema')
const Order = require('../../models/orderSchema')
const Wallet = require('../../models/walletSchema')

const loadWalletPage = async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ userId: req.session.user }); 
        if (!wallet) {
            wallet = new Wallet({
                userId: req.session.user,
                balance: 0,
                transactions: [] 
            });
            await wallet.save();
        }
        res.render('wallet', {
            wallet
        }); 
    } catch (error) {
        console.log('Error while loading wallet page', error);
        res.redirect("/pageNotfound")
    }
}

module.exports = {
    loadWalletPage
}