const User= require('../../models/userSchema')
const { successResponse, errorResponse } = require('../../helpers/responseHandler')

const customerInfo= async(req,res)=>{
    try { 
        let search= "";
        if(req.query.search){
            search = req.query.search
        }
        let page=1;
        if(req.query.page){
            page= parseInt(req.query.page) 
        }

        let sort = req.query.sort || 'createdAt';  
        let order = req.query.order === 'desc' ? 1 : -1; 
        const limit=5
        const userData=await User.find({
            isAdmin:false,
            $or:[
                {name:{$regex:".*"+search+".*"}},
                {email:{$regex:".*"+search+".*"}}
            ]
        })
        .sort({ [sort]: order })
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
            limit:limit,
            sort: req.query.sort || 'name',
            order: req.query.order || 'asc'
        })

    } catch (error) {
        console.error(error);
        res.redirect("/pageError")
    }
}

const toggleCustomerBlocking=async(req,res)=>{
    try {
         const customerId= req.query.id;

         const customer=await User.findById(customerId);
         if(!customer){
            return res.redirect("/pageError");
         }
         const newStatus= !customer.isBlocked
         await User.updateOne({_id:customerId},{$set:{isBlocked:newStatus}})
         res.redirect("/admin/users")
    } catch (error) {
        console.error(error, "Error while block/unblock customers.");
        res.redirect("/pageError")
    }
}




module.exports={
    customerInfo,
    toggleCustomerBlocking

}