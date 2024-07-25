
// Middleware to protect userId routes
const requireLogin = async(req,res,next)=>{
    try {
        if(req.session.userId){
            return next()
        }else{
            return res.redirect('/')
        }
        
    } catch (error) {
        console.log(error.message); 
    }
}
 

// Middleware to protect adminId routes
const adminRequireLogin = async(req,res,next)=>{
    try {
        if(req.session.adminId){
            return next()
        }else{
            return res.redirect('/admin')
        }
        
    } catch (error) {
        console.log(error.message);
  

    }
}


module.exports = {
    requireLogin,
    adminRequireLogin
}; 