const User=require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

let refreshTokens=[];
const authController={
    registerUser: async (req, res) => {
     
        try {
          const salt = await bcrypt.genSalt(10);

          const hashed = await bcrypt.hash(req.body.password, salt);

          //Create new user
          const newUser = await new User({
            username: req.body.username,
            email: req.body.email,
            password: hashed,
          });
    
          //Save user to DB
          const user = await newUser.save();
          res.status(200).json(user);
        } catch (err) {
          console.error(err);
          res.status(500).json(err);
        }
      },
      //GenerateAccessToken
      generateAccessToken :(user)=>{
        return jwt.sign( {
          id: user.id,
          admin: user.isAdmin 
         },
         process.env.JWT_ACCESS_KEY,
         {expiresIn:"10s"})
      },
      //Gennate Refresh Token
      generateRefreshToken :(user)=>{
        return jwt.sign(
          {
          id: user.id,
          admin: user.isAdmin 
         },
         process.env.JWT_REFRESH_KEY,
         {expiresIn:"365h"}
        )
      },
      //login
      loginUser:async(req, res)=>{
        try{
            const user = await User.findOne({username:req.body.username});

            if(!user){
             return  res.status(400).json("Wrong username !")
            }

            const validPassword =  await bcrypt.compare( req.body.password,user.password)

            if(!validPassword){
              return  res.status(404).json("Wrong password !")
            }
            if(user && validPassword){
              //create accessToken
              const accessToken=authController.generateAccessToken(user)
              //refreshToken
              const refreshToken=authController.generateRefreshToken(user)
              refreshTokens.push(refreshToken)
              //lưu refreshToken vào cookies              
              res.cookie("refreshToken", refreshToken,{
                httpOnly: false,
                secure: false,
                path:"/",
                sameSite:"strict"
              })
               const{password,...other}=user._doc;
              
               return res.status(200).json({...other,accessToken,refreshToken})

            }

        }catch (err) {
          return res.status(500).json(err);
        }

      },
      requestRefreshToken: async(req, res) =>{
        //lay refresh token cua user
        
        const refreshToken =  req.body.refresh;
        //check refresh token cua user hay khong
        if(!refreshTokens.includes(refreshToken)){
          return res.status(400).json("Refresh Token is not valid");
        }
        if(!refreshToken){
         return res.status(401).json("You're not authenticated")
        }
        jwt.verify(refreshToken,process.env.JWT_REFRESH_KEY,(err,user)=>{
          console.log(user);
          if(err){
            console.log(err)
          }
          
          //Filter refresh token old
          refreshTokens = refreshTokens.filter((token)=>token !== refreshToken)
          //Create a new accessToken,refreshToken
          const newAccessToken =authController.generateAccessToken(user);
          const newRefreshToken=authController.generateRefreshToken(user);

         


          refreshTokens.push(newRefreshToken)


          res.cookie("refreshToken", newRefreshToken,{
            httpOnly: false,
            secure: false,
            path:"/",
            sameSite:"strict"
          });
         return res.status(200).json({accessToken:newAccessToken})
        })
      },
      userLogout: async(req, res, next) => {
        res.clearCookie("refreshToken");
        refreshTokens=refreshTokens.filter((token)=>token !==req.cookies.refreshToken);
       return res.status(200).json("Logout Success");
      }

   
}


//Store token
//1. Dùng localStorage
//2.Cookies
//3. Redux Store
//HTTPONLY COOKIES->REFESH TOKEN
module.exports=authController; 