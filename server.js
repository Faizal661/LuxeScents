const express = require('express')
const session = require('express-session')
const nocache = require('nocache');
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const userRouter = require('./routes/userRoute')
const adminRouter = require('./routes/adminRoute')
const userController = require('./controllers/user/userController')
const adminController = require('./controllers/admin/adminController')
const fetchCartCount = require('./middlewares/cartCount');
const fetchWishlistCount = require('./middlewares/wishlistCount');
const passport = require('./config/passport')
const connectDB = require('./config/db');
require('dotenv').config();

const app = express()

connectDB();

const port = process.env.PORT || 3000;

app.use(nocache())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 3600000,
    }
}))

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.set('cache-control', 'no-store')
    next()
})

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'public', 'user-assets')));


app.set('view engine', 'ejs');
app.set('views', [path.join(__dirname, 'views/users'), path.join(__dirname, 'views/admin')]);

app.use(fetchCartCount);
app.use(fetchWishlistCount);

app.use('/', userRouter)
app.use('/admin', adminRouter)

app.get('*', userController.pageNotfound)
app.get('/admin/*', adminController.pageError)
 

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})
 