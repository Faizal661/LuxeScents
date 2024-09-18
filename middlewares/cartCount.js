const Cart = require('../models/cartSchema');

const fetchCartCount = async (req, res, next) => {
  try {
    if (req.session.user) {
      const userId = req.session.user;
      const cart = await Cart.findOne({ userId });
      const cartCount = cart ? cart.products.length : 0 ;

      res.locals.cartCount = cartCount;
      res.locals.userName = req.session.userName;
    } else {
      res.locals.cartCount = 0 ;
    }
  } catch (error) {
    console.error('Error fetching cart count:', error);
    res.locals.cartCount = 0 ;
  }
  next();
};

module.exports = fetchCartCount;
