const Product=require('../models/productSchema')


const productInfo=async(req,res)=>{
    try {
        let search= "";
        if(req.query.search){
            search = req.query.search
        }
        let page=1;
        if(req.query.page){
            page=req.query.page
        }

        const limit=8
        const productsData=await Product.find({
            productName:{$regex:".*"+search+".*"}
        })
        .limit(limit*1)
        .skip((page-1)*limit)
        .exec();

        const count = await Product.find({
            productName:{$regex:".*"+search+".*"}
        }).countDocuments();

        res.render('products',{
            adminName:req.session.adminName,
            data:productsData,
            totalPages:Math.ceil(count/limit),
            currentPage:page,
            limit:limit
        })

    } catch (error) {
        console.error(error);
        res.redirect("/pageerror")
    }
}

const productBlocked=async(req,res)=>{
    try {
         let id= req.query.id;
         await Product.updateOne({_id:id},{$set:{isBlocked:true}})
         res.redirect("/admin/products")
    } catch (error) {
        res.redirect("/pageerror")
    }
}

const productunBlocked=async(req,res)=>{
    try {
        let id= req.query.id;
        await Product.updateOne({_id:id},{$set:{isBlocked:false}})
        res.redirect("/admin/products")
   } catch (error) {
       res.redirect("/pageerror")
   }
}

const addProducts=async(req,res)=>{
    try {
        res.render('addProducts',{adminName:req.session.adminName})
    } catch (error) {
        console.error(error);
        res.redirect("/pageerror")
    }
}








module.exports={
    productInfo,
    productBlocked,
    productunBlocked,
    addProducts
}


