import express from 'express'
import session from 'express-session'
import nocache from 'nocache';
import path from 'path'
import dotenv from 'dotenv'
dotenv.config();
import userRouter from './routes/userRoute.js'
import adminRouter from './routes/adminRoute.js'
import { pageNotfound } from './controllers/user/userController.js'
import { pageError } from './controllers/admin/adminController.js'
import { fetchCartCount } from './middlewares/cartCount.js';
import { fetchWishlistCount } from './middlewares/wishlistCount.js';
import { v4 as uuidv4 } from 'uuid'
import connectDB  from './config/db.js'
import passport from './config/passport.js'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()

const PORT = process.env.PORT || 3000;

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

app.get('/admin/*', pageError)
app.get('*', pageNotfound)

connectDB().then(() => app.listen(PORT, () => {
    console.log(`server  ✅`)
}))
