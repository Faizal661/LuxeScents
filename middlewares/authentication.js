const User =require("../models/userSchema")
// Middleware to protect userId routes

const userAuth = (req,res,next)=>{
        if(req.session.user){
            User.findById(req.session.user)
                .then(data=>{
                    if(data && !data.isBlocked){
                        next();
                    }else{
                        res.redirect('/login')
                    }
                })
                .catch(error=>{
                    console.log("Error in user auth middleware",error)
                    res.status(500).send("Internal Server error")
                })
            
        }else{
             res.redirect('/login')
        }
}

const adminAuth = (req,res,next)=>{
        User.findOne({isAdmin:true})
            .then(data=>{
                if(data){
                    next();
                }else{
                    res.redirect('/admin/login')
                }
            })
            .catch(error=>{
                console.log("Error in adminauth middleware",error)
                res.status(500).send("Internal Server error")
            })
        
    
}
 



module.exports = {
    userAuth,
    adminAuth
   
}; 