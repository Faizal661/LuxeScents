const Category = require("../../models/categorySchema")
const Product = require('../../models/productSchema')
const { ProductOffer, CategoryOffer } = require('../../models/offerSchema')
const { successResponse, errorResponse } = require('../../helpers/responseHandler')


//product offer management 

const loadProductOffers = async (req, res) => {
    try {
        const productOffers = await ProductOffer.find({});
        res.render('offers/productOffers', { productOffers });
    } catch (err) {
        console.error('Error loading product offers:', err);
        res.redirect("/admin/pageError")
    }
};


const loadAddProductOfferPage = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ productName: { $collations: { locale: 'en', strength: 1 } } });
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
        console.log('prdict', product)
        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Create a new product offer
        const newOffer = new ProductOffer({
            offerName,
            productId,
            productName: product.productName, // Use the product name from the fetched product
            offerPercentage
        });

        // Save the offer to the database
        await newOffer.save();
        res.redirect('/admin/productOffers'); // Redirect to the list of product offers (you can modify this as needed)
    } catch (err) {
        console.error('Error adding product offer:', err);
        res.redirect("/pageError")
    }
};

const toggleProductOffer = async (req, res) => {
    const offerId = req.params.id;

    try {
        const offer = await ProductOffer.findById(offerId);

        if (!offer) {
            return res.status(404).send('Offer not found');
        }

        // Toggle isActive status
        offer.isActive = !offer.isActive;
        await offer.save();

        res.redirect('/admin/productOffers'); // Redirect back to the product offers page
    } catch (err) {
        console.error('Error toggling offer status:', err);
        res.redirect("/pageError")
    }
};

const deleteProductOffer = async (req, res) => {
    const offerId = req.params.id;

    try {
        const offer = await ProductOffer.findById(offerId);

        if (!offer) {
            return res.status(404).send('Offer not found');
        }

        // Delete the offer from the database
        await offer.remove();

        res.redirect('/admin/productOffers'); // Redirect back to the product offers page
    } catch (err) {
        console.error('Error deleting offer:', err);
        res.redirect("/pageError")
    }
};



//category offer management 

const loadCategoryOffers = async (req, res) => {
    try {
        const category = await Category.find({})
        res.render('offers/categoryOffers', { category });
    } catch (err) {
        console.error('Error loading categories offers:', err);
        res.redirect("/pageError")
    }
}

const loadAddCategoryOfferPage = async (req, res) => {
    try {
        const category = await Category.find({}).sort({ name: 1 })
        console.log('asdff', category)
        res.render('offers/addCategoryOffer', { category });
    } catch (err) {
        console.error('Error loading add category offer page:', err);
        res.redirect("/pageError")
    }
}





module.exports = {
    loadProductOffers,
    loadAddProductOfferPage,
    addProductOffer,
    toggleProductOffer,
    deleteProductOffer,

    loadCategoryOffers,
    loadAddCategoryOfferPage
}