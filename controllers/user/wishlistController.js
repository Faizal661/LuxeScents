const Wishlist = require('../../models/wishlistSchema')
const { successResponse, errorResponse } = require('../../helpers/responseHandler')


const loadWishlist = async (req, res) => {
    try {
        const userId = req.session.user;  

        const wishlist = await Wishlist.findOne({ userId })
        .populate({
            path: 'products.productId',
            populate: { path: 'brand category' } 
        });

        if (!wishlist) {
            return res.render('wishlist', {products: [], currentPage: 1, totalPages: 1 });
        }
        const products = wishlist.products.map(item => item.productId);

        const page = parseInt(req.query.page) || 1;
        const pageSize = 4; 
        const totalProducts = products.length;
        const totalPages = Math.ceil(totalProducts / pageSize);

        const paginatedProducts = products.slice((page - 1) * pageSize, page * pageSize);

        res.render('wishlist', {
            products: paginatedProducts,
            currentPage: page,
            totalPages: totalPages
        });


    } catch (error) {
        console.error('Error while loading wishlist:', error);
        res.redirect("/pageNotfound")
    }
}


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

const toggleWishlist = async (req, res) => {
    try {
        const userId = req.session.user;
        const { productId } = req.body;

        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) { 
            wishlist = new Wishlist({ userId, products: [{ productId }] });
            await wishlist.save();
            return successResponse(res, { inWishlist: true }, "Product added to wishlist");
        }

        const productIndex = wishlist.products.findIndex(item => item.productId.toString() === productId);

        if (productIndex >= 0) {
            wishlist.products.splice(productIndex, 1);
            await wishlist.save();
            return successResponse(res, { inWishlist: false }, "Product removed from wishlist");
        } else {
            wishlist.products.push({ productId });  
            await wishlist.save();
            return successResponse(res, { inWishlist: true }, "Product added to wishlist");
        }

    } catch (error) {
        console.error('Error toggling wishlist:', error);
        return errorResponse(res, error, "Failed to update wishlist.");
    }
}


module.exports = {
    toggleWishlist,
    loadWishlist,
    removeFromWishlist
}