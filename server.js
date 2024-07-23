const express = require('express')
const mongoose=require('mongoose')
mongoose.connect('mongodb://localhost:27017/node_crud');
require('dotenv').config();

const path=require('path')
const bodyparser=require( "body-parser")
const session=require('express-session')
const {v4:uuidv4}=require('uuid')
const router=require('./routes/userRoute')
const adminRouter=require('./routes/adminRoute')
const nocache = require('nocache');
 

const app =express()   

const port=3000;
 

  
app.use(nocache())
 
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))

app.use(session({   
    secret:uuidv4(),
    resave:false,
    saveUninitialized:true,
    cookie:{maxAge:3600000} 
}))


app.use(express.static('uploads'))

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});


app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/static',express.static(path.join(__dirname,'public')))
app.use('/assets',express.static(path.join(__dirname,'public/assets')))


app.use('/',router)
app.use('/admin',adminRouter)




app.listen(port,()=>{
    console.log("http://localhost:3000")
})
