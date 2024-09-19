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
        }else{
            wallet.transactions.sort((a, b) => b.createdAt - a.createdAt);
        }
        res.render('wallet', {
            wallet,
            transactions: wallet.transactions
        }); 
    } catch (error) {
        console.log('Error while loading wallet page', error);
        res.redirect("/pageNotfound")
    }
}

module.exports = {
    loadWalletPage
}