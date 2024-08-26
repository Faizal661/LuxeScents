const Cart = require('../models/cartSchema'); 

const fetchCartCount = async (req, res, next) => {
  try {
    if (req.session.user) {
      const userId = req.session.user; 
      const cart = await Cart.findOne({ userId });
      const cartCount = cart ? cart.products.length : ''; 

      res.locals.cartCount = cartCount;
    } else {
      res.locals.cartCount = '';
    }
  } catch (error) {
    console.error('Error fetching cart count:', error);
    res.locals.cartCount = ''; 
  }

  next(); 
};

module.exports = fetchCartCount;
