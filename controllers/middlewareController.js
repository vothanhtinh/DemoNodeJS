const jwt=require('jsonwebtoken');

const middlewareController ={
    //verify
    verifyToken : async(req, res, next)=>{
        const token= req.headers.token;
        if (token){
            //Bearer 12355
            const accessToken = token.split(" ")[1];
            jwt.verify(accessToken,process.env.JWT_ACCESS_KEY,(err,user)=>{
                if(err){
                   return res.status(403).json("Token is not valid")
                }
                req.user = user;
                next();
            })
        }
        else{
           return res.status(401).json("you are not authenticated")
        }
    },
    verifyTokenAndAdminAuth: async(req,res,next)=>{
        middlewareController.verifyToken(req,res,()=>{
            console.log(req.user);
            if(req.user.id == req.params.id || req.user.admin){
                next();
            }
            else{
                res.status(403).json("You are not allowed to delete other")
            }
        })
    }

}

module.exports = middlewareController