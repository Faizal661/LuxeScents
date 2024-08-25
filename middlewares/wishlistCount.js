const Wishlist = require('../models/wishlistSchema'); 

const fetchWishlistCount = async (req, res, next) => {
  try {
    if (req.session.user) {
      const userId = req.session.user; 
      const wishlist = await Wishlist.findOne({ userId });
      const wishlistCount = wishlist ? wishlist.products.length : 0; 

      res.locals.wishlistCount = wishlistCount;
    } else {
      res.locals.wishlistCount = 0;
    }
  } catch (error) {
    console.error('Error fetching wishlist count:', error);
    res.locals.wishlistCount = 0; 
  }

  next(); 
};

module.exports = fetchWishlistCount;