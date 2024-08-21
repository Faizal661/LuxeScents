const express = require('express')    


require('dotenv').config();
  
const DB_URI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB_NAME}?authSource=admin`;

const mongoose=require('mongoose')
mongoose.connect(DB_URI)
.then(()=>console.log('mongodb √√√'))
.catch(err=>console.log('error connecting to the database..',err))
 
const path=require('path')
const bodyparser=require( "body-parser")   
const session=require('express-session')
const {v4:uuidv4}=require('uuid')
const userRouter=require('./routes/userRoute')
const adminRouter=require('./routes/adminRoute')
const nocache = require('nocache');
const userController=require('./controllers/user/userController')
const adminController=require('./controllers/admin/adminController')
const passport=require('./config/passport')
   

const app =express()   

const port=3000;
  

  
app.use(nocache())
 
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))

app.use(session({   
    secret:uuidv4(),
    resave:false,
    saveUninitialized:true,
    cookie:{
        secure:false,//in production turn to true ,
        httpOnly:true,
        maxAge:3600000,
    } 
}))


app.use(passport.initialize());
app.use(passport.session());



app.use((req,res,next)=>{
    res.set('cache-control','no-store')
    next()
})



app.use(express.static('uploads'))

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});
  

app.set('view engine','ejs'); 
app.set('views',[ path.join(__dirname, 'views/users'), path.join(__dirname, 'views/admin')]);


app.use(express.static(path.join(__dirname,'public')))


 
 
app.use('/',userRouter)
app.use('/admin',adminRouter)
 
app.get('*', userController.pageNotfound)
app.get('/admin/*', adminController.pageerror)




app.listen(port,()=>{
    console.log("http://localhost:3000")
})
 