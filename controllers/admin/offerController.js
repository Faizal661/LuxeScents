const Category = require("../../models/categorySchema")
const Product = require('../../models/productSchema')
const { ProductOffer, CategoryOffer } = require('../../models/offerSchema')
const { successResponse, errorResponse } = require('../../helpers/responseHandler')

//--------------------------------------------------------------------------
//---------------         product offer management      -----------------//
//--------------------------------------------------------------------------


const loadProductOffers = async (req, res) => {
    try {
        let search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;
        const productOffers = await ProductOffer.find({ offerName: { $regex: ".*" + search + ".*", $options: "i" } }).sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalProductOffers = await ProductOffer.countDocuments({ offerName: { $regex: ".*" + search + ".*", $options: "i" } })
        const totalPages = Math.ceil(totalProductOffers / limit);

        res.render('offers/productOffers',
            {
                productOffers,
                currentPage: page,
                totalPages,
                totalProductOffers,
                limit
            });
    } catch (err) {
        console.error('Error loading product offers:', err);
        res.redirect("/admin/pageError")
    }
};


const loadAddProductOfferPage = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ productName: 1 });
        res.render('offers/addProductOffer', { products });
    } catch (err) {
        console.error('Error loading add Product offer page:', err);
        res.redirect("/admin/pageError")
    }
};

const addProductOffer = async (req, res) => {
    const { offerName, productId, offerPercentage } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        const newOffer = new ProductOffer({
            offerName,
            productId,
            productName: product.productName,
            offerPercentage
        });
        await newOffer.save();

        product.offerPercentage = offerPercentage
        await product.save()

        res.redirect('/admin/productOffers');
    } catch (err) {
        console.error('Error adding product offer:', err);
        res.redirect("/admin/pageError")
    }
};

const toggleProductOffer = async (req, res) => {
    const offerId = req.params.id;

    try {
        const offer = await ProductOffer.findById(offerId);

        if (!offer) {
            return res.status(404).send('Offer not found');
        }

        const productId = offer.productId
        const product = await Product.findById(productId);
        if (offer.isActive) {
            product.offerPercentage = 0
            await product.save()
        } else {
            product.offerPercentage = offer.offerPercentage
            await product.save()
            //acrivate -> deactivate ( other offers need to deactivate based on productId in productOFfers )
            const otherOffers = await ProductOffer.find({ productId, _id: { $ne: offer._id } });

            for (let offer of otherOffers) {
                offer.isActive = false;
                await offer.save()
            }
        }

        offer.isActive = !offer.isActive;
        await offer.save();

        res.redirect('/admin/productOffers');
    } catch (err) {
        console.error('Error toggling offer status:', err);
        res.redirect("/admin/pageError")
    }
};

const deleteProductOffer = async (req, res) => {
    const offerId = req.params.id;


    try {
        const offer = await ProductOffer.findByIdAndDelete(offerId);

        const productId = offer.productId
        const product = await Product.findById(productId);

        product.offerPercentage = 0
        await product.save()

        if (!offer) {
            return errorResponse(res, err, 'Offer not found');
        }
        successResponse(res, {}, "Product Offer deleted successfully")


    } catch (err) {
        console.error('Error deleting offer:', err);
        res.redirect("/admin/pageError")
    }
};


//--------------------------------------------------------------------------
//---------------         category offer management      -----------------//
//--------------------------------------------------------------------------

const loadCategoryOffers = async (req, res) => {
    try {
        let search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;
        const categoryOffer = await CategoryOffer.find({ offerName: { $regex: ".*" + search + ".*", $options: "i" } }).sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCategoryOffer = await CategoryOffer.countDocuments({ offerName: { $regex: ".*" + search + ".*", $options: "i" } })
        const totalPages = Math.ceil(totalCategoryOffer / limit);

        res.render('offers/categoryOffers',
            {
                categoryOffer,
                currentPage: page,
                totalPages,
                totalCategoryOffer,
                limit
            });
    } catch (err) {
        console.error('Error loading categories offers:', err);
        res.redirect("/admin/pageError")
    }
}

const loadAddCategoryOfferPage = async (req, res) => {
    try {
        const category = await Category.find({}).sort({ name: 1 })
        res.render('offers/addCategoryOffer', { category });
    } catch (err) {
        console.error('Error loading add category offer page:', err);
        res.redirect("/admin/pageError")
    }
}

const addCategoryOffer = async (req, res) => {
    const { offerName, categoryId, offerPercentage } = req.body;

    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).send('Category not found');
        }

        const newOffer = new CategoryOffer({
            offerName,
            categoryId,
            categoryName: category.name,
            offerPercentage
        });
        await newOffer.save();

        category.offerPercentage = offerPercentage
        await category.save()

        //change all the offer of products that comes under this categories offer in to this offer percentage
        const productsInThisCategory = await Product.find({ category: categoryId })
        for (let product of productsInThisCategory) {
            product.offerPercentage = offerPercentage;
            await product.save()
        }

        res.redirect('/admin/CategoryOffers');
    } catch (err) {
        console.error('Error adding category offer:', err);
        res.redirect("/admin/pageError")
    }
}

const toggleCategoryOffer = async (req, res) => {
    const offerId = req.params.id;

    try {
        const offer = await CategoryOffer.findById(offerId);

        if (!offer) {
            return res.status(404).send('Offer not found');
        }

        const categoryId = offer.categoryId
        const category = await Category.findById(categoryId);
        const productsInThisCategory = await Product.find({ category: categoryId })

        if (offer.isActive) {
            category.offerPercentage = 0
            await category.save();
            //changing all the offer of products that comes under this categories offer in to zero when this is unlisted.
            for (let product of productsInThisCategory) {
                product.offerPercentage = 0
                await product.save()
            }
        } else {
            category.offerPercentage = offer.offerPercentage
            await category.save()

            //other category offers=> {acrivate -> deactivate} ( other offers need to deactivate based on categoryId in CategoryOffers )
            const otherOffers = await CategoryOffer.find({ categoryId, _id: { $ne: offer._id } });
            for (let offer of otherOffers) {
                offer.isActive = false;
                await offer.save()
            }

            //change all the offer of products that comes under this categories offer in to this offer percentage
            for (let product of productsInThisCategory) {
                product.offerPercentage = offer.offerPercentage
                await product.save()
            }
        }

        offer.isActive = !offer.isActive;
        await offer.save();

        res.redirect('/admin/CategoryOffers');
    } catch (err) {
        console.error('Error toggling offer status:', err);
        res.redirect("/admin/pageError")
    }
};

const deleteCategoryOffer = async (req, res) => {
    const offerId = req.params.id;
    try {
        const offer = await CategoryOffer.findByIdAndDelete(offerId);

        const categoryId = offer.categoryId
        const category = await Category.findById(categoryId);
        const productsInThisCategory = await Product.find({ category: categoryId })

        category.offerPercentage = 0
        await category.save()
        //while deleting this offer this will change all the offer of products that comes under this category offer into zero.
        for (let product of productsInThisCategory) {
            product.offerPercentage = 0
            await product.save()
        }
        if (!offer) {
            return errorResponse(res, err, 'Offer not found');
        }

        successResponse(res, {}, "category Offer deleted successfully")

    } catch (err) {
        console.error('Error deleting offer:', err);
        res.redirect("/admin/pageError")
    }
};






module.exports = {
    loadProductOffers,
    loadAddProductOfferPage,
    addProductOffer,
    toggleProductOffer,
    deleteProductOffer,

    loadCategoryOffers,
    loadAddCategoryOfferPage,
    addCategoryOffer,
    toggleCategoryOffer,
    deleteCategoryOffer,
}