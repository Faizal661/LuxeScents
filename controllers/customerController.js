const User= require('../models/userSchema')

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

        let sort = req.query.sort || 'name';  // Default sort by name
        let order = req.query.order === 'desc' ? -1 : 1;  // Default order is ascending

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