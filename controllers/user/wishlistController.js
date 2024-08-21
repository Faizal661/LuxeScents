const Wishlist = require('../../models/wishlistSchema')
const { successResponse, errorResponse } = require('../../helpers/responseHandler')


const loadWishlist = async (req, res) => {
    try {
        const userName = req.session.userName
        const userId = req.session.user;  

        const wishlist = await Wishlist.findOne({ userId })
        .populate({
            path: 'products.productId',
            populate: { path: 'brand category' } 
        });

        if (!wishlist) {
            return res.render('wishlist', {userName, products: [], currentPage: 1, totalPages: 1 });
        }
        const products = wishlist.products.map(item => item.productId);

        const page = parseInt(req.query.page) || 1;
        const pageSize = 4; 
        const totalProducts = products.length;
        const totalPages = Math.ceil(totalProducts / pageSize);

        const paginatedProducts = products.slice((page - 1) * pageSize, page * pageSize);

        res.render('wishlist', {
            userName,
            products: paginatedProducts,
            currentPage: page,
            totalPages: totalPages
        });


    } catch (error) {
        console.error('Error while loading wishlist:', error);
        res.redirect("/pageNotfound")
    }
}


const addProductToWishlist = async (req, res) => {
    try {
        const userId = req.session.user;  

        const { productId } = req.body;

        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            wishlist = new Wishlist({ userId, products: [{ productId }] });
        } else {
            const productExists = wishlist.products.some(p => p.productId.equals(productId));
            if (!productExists) {
                wishlist.products.push({ productId });
            }
        }

        await wishlist.save();
        res.json({ success: true, message: 'Product added to wishlist' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.user;

        await Wishlist.updateOne(
            { userId },
            { $pull: { products: { productId } } }
        );

        res.status(200).json({ success: true, message: "Product removed from wishlist." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to remove product from wishlist." });
    }
};

module.exports = {
    loadWishlist,
    addProductToWishlist,
    removeFromWishlist
}