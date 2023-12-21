var jwt=require('jsonwebtoken')
require("dotenv").config()


const verifyToken=(req,res,next)=>{
const token=req.header('Authorization');
if(!token){
    return res.status(403).send("enter valid token")
}
try{

let verify_token=jwt.verify(token,process.env.TOKEN_KEY)
req.user=verify_token;
}
catch{
    return res.status(403).send("enter valid token")
}
return next()
}
module.exports=verifyToken