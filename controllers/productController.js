const Product=require('../models/productSchema')
const Category=require('../models/categorySchema')
const Brand= require('../models/brandSchema')
const upload = require('../middlewares/multer')
const path = require('path');

const productAlreadyExists="Product already exists"

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

        const limit=5
        const productsData=await Product.find({
            productName:{$regex:".*"+search+".*"}
        })
        .populate('brand')
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
            limit:limit,
            
        })

    } catch (error) {
        console.error(error);
        res.redirect("/pageerror")
    }
}


const toggleProductListing = async (req, res) => {
    try {
        const productId = req.query.id;
        const product = await Product.findById(productId);
        if(!product){
            return res.redirect("/pageerror");
         }
        const newStatus = !product.isBlocked;

        await Product.updateOne({ _id: productId }, { $set: { isBlocked: newStatus } });

        res.redirect("/admin/products");
    } catch (error) {
        console.error(error, "Error while toggling product listing status.");
        res.redirect("/pageerror");
    }
};


const getAddProduct=async(req,res)=>{
    try {
        const categories = await Category.find({isListed:true});
        const brands = await Brand.find({isBlocked:false});
        res.render('addProducts',{adminName:req.session.adminName,categories: categories,brands:brands})
    } catch (error) {
        console.error(error);
        res.redirect("/pageerror")
    }
}
 

const uploadImages = upload.array('productImages',10);


const addProduct = async (req, res) => {
    try {
        uploadImages(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(400).json({ error: "Error uploading files." });
            }
            // console.log('Body:', req.body);
            // console.log('Uploaded files:', req.files); // Debug log

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: "No files uploaded." });
            }
            
            const imagePaths = req.files.map(file => file.path);
            const imageURL = imagePaths.map(path => path.replace('public\\', ''));
            console.log(imageURL);

            const existingProduct = await Product.findOne({ productName: req.body.productName });
            if (existingProduct) {
                return res.status(400).json({ error: productAlreadyExists });
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
                productImages: imageURL,
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



const getEditProduct=async(req,res)=>{
    try {
        const productId=req.params.id
        const product=await Product.findById(productId)
        const categories = await Category.find({});
        const brands = await Brand.find({});
        res.render('editProduct',{adminName:req.session.adminName,categories: categories,brands:brands,product})
    } catch (error) {
        console.error(error);
        res.redirect("/pageerror")
    }
}

const editProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        uploadImages(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(400).json({ error: "Error uploading files." });
            }

            // Fetch the existing product to get current images
            const existingProduct = await Product.findById(productId);
            if (!existingProduct) {
                return res.status(404).json({ error: "Product not found" });
            }

            // If no new files are uploaded, use the existing images
            let imageURL = existingProduct.productImages;

            // Handle removed images (if any)
            if (req.body.removedImages && req.body.removedImages.length > 0) {
                const removedImages = Array.isArray(req.body.removedImages) 
                    ? req.body.removedImages 
                    : [req.body.removedImages];
                imageURL = imageURL.filter(img => !removedImages.includes(img));
            }

            // Add newly uploaded images to the list
            if (req.files && req.files.length > 0) {
                const imagePaths = req.files.map(file => file.path);
                const newImageURLs = imagePaths.map(path => path.replace('public\\', ''));
                imageURL = imageURL.concat(newImageURLs);
            }

            // Ensure images are not concatenated unnecessarily
            if (!req.files || req.files.length === 0) {
                imageURL = req.body.existingImages || imageURL;
            }

            const updateProduct = await Product.findByIdAndUpdate(productId, {
                productName: req.body.productName,
                description: req.body.description,
                brand: req.body.brands,
                category: req.body.category,
                regularPrice: req.body.regularPrice,
                salePrice: req.body.salePrice,
                gender: req.body.gender,
                size: Array.isArray(req.body.size) ? req.body.size : [req.body.size],
                quantity: req.body.quantity,
                productImages: imageURL,
                status: req.body.status,
            }, { new: true });

            if (updateProduct) {
                res.json({ message: "Product updated successfully" });
            } else {
                res.status(404).json({ error: "Product not found" });
            }

        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// const editProduct = async (req, res) => {
//     try {
//         const productId = req.params.id;

//         uploadImages(req, res, async (err) => {
//             if (err) {
//                 console.error(err);
//                 return res.status(400).json({ error: "Error uploading files." });
//             }

//             // If no new files are uploaded, just use the existing images
//             let imageURL = req.body.existingImages || [];

//             // Add newly uploaded images to the list
//             if (req.files && req.files.length > 0) {
//                 const imagePaths = req.files.map(file => file.path);
//                 const newImageURLs = imagePaths.map(path => path.replace('public\\', ''));
//                 imageURL = imageURL.concat(newImageURLs);
//             }

//             console.log("Merged Image URLs:", imageURL);

//             const existingProduct = await Product.findOne({ productName: req.body.productName });
//             if (existingProduct && existingProduct._id.toString() !== productId) {
//                 return res.status(400).json({ error: productAlreadyExists });
//             }

//             const updateProduct = await Product.findByIdAndUpdate(productId, {
//                 productName: req.body.productName,
//                 description: req.body.description,
//                 brand: req.body.brands,
//                 category: req.body.category,
//                 regularPrice: req.body.regularPrice,
//                 salePrice: req.body.salePrice,
//                 gender: req.body.gender,
//                 size: Array.isArray(req.body.size) ? req.body.size : [req.body.size],
//                 quantity: req.body.quantity,
//                 productImages: imageURL,
//                 status: req.body.status,
//             }, { new: true });

//             await updateProduct.save();

//             if (updateProduct) {
//                 res.json({ message: "Product updated successfully" });
//             } else {
//                 res.status(404).json({ error: "Product not found" });
//             }

//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: "Internal server error" });
//     }
// };





module.exports={
    productInfo,
    toggleProductListing,
    getAddProduct,
    addProduct,
    uploadImages,
    getEditProduct,
    editProduct
}


