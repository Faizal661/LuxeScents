const User=require('../../models/userSchema')
const Order=require('../../models/orderSchema')

const loadWalletPage=async(req,res)=>{
    try {
        res.render('Wallet')
    } catch (error) {
        
    }
}

module.exports={
    loadWalletPage
}