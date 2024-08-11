const User= require('../models/userSchema')

const customerInfo= async(req,res)=>{
    try { 
        let search= "";
        if(req.query.search){
            search = req.query.search
        }
        let page=1;
        if(req.query.page){
            page=req.query.page
        }
        const limit=5
        const userData=await User.find({
            isAdmin:false,
            $or:[
                {name:{$regex:".*"+search+".*"}},
                {email:{$regex:".*"+search+".*"}}
            ]
        })
        .limit(limit*1)
        .skip((page-1)*limit)
        .exec();

        const count = await User.find({
            isAdmin:false,
            $or:[
                {name:{$regex:".*"+search+".*"}},
                {email:{$regex:".*"+search+".*"}}
            ]
        }).countDocuments();

        res.render('customers',{
            adminName:req.session.adminName,
            userData:userData,
            totalPages:Math.ceil(count/limit),
            currentPage:page,
            limit:limit
        })

    } catch (error) {
        console.error(error);
        res.redirect("/pageerror")
    }
}

const toggleCustomerBlocking=async(req,res)=>{
    try {
         const customerId= req.query.id;

         const customer=await User.findById(customerId);
         if(!customer){
            return res.redirect("/pageerror");
         }
         const newStatus= !customer.isBlocked
         await User.updateOne({_id:customerId},{$set:{isBlocked:newStatus}})
         res.redirect("/admin/users")
    } catch (error) {
        console.error(error, "Error while block/unblock customers.");
        res.redirect("/pageerror")
    }
}




module.exports={
    customerInfo,
    toggleCustomerBlocking

}