const Product=require('../models/productSchema')
const Category=require('../models/categorySchema')
const Brand= require('../models/brandSchema')
const upload = require('../middlewares/multer')
const path = require('path');


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

const getAddProduct=async(req,res)=>{
    try {
        const categories = await Category.find({});
        const brands = await Brand.find({});
        res.render('addProducts',{adminName:req.session.adminName,categories: categories,brands:brands})
    } catch (error) {
        console.error(error);
        res.redirect("/pageerror")
    }
}


const uploadImages = upload.array('productImages', 5);


const addProduct = async (req, res) => {
    try {
       

        uploadImages(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(400).json({ error: "Error uploading files." });
            }
           

            console.log('Files:', req.files);
            console.log('Body:', req.body);

            console.log('Uploaded files:', req.files); // Debug log

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: "No files uploaded." });
            }
    


            
            const imagePaths = req.files.map(file => file.path);

            const existingProduct = await Product.findOne({ productName: req.body.productName });
            if (existingProduct) {
                return res.status(400).json({ error: "Product already exists" });
            }

            const newProduct = new Product({
                productName: req.body.productName,
                description: req.body.description,
                brand: req.body.brands,
                category: req.body.category,
                regularPrice: req.body.regularPrice,
                salePrice: req.body.salePrice,
                gender: req.body.gender,
                size: Array.isArray(req.body.size) ? req.body.size : [req.body.size], 
                quantity: req.body.quantity,
                productImages: imagePaths,
                status: req.body.status,
            });

            await newProduct.save();

            return res.json({ message: "Product added successfully" });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};








module.exports={
    productInfo,
    productBlocked,
    productunBlocked,
    getAddProduct,
    addProduct,
    uploadImages
}


