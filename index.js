require("dotenv").config()
const bcrypt=require('bcrypt')
var jwt=require('jsonwebtoken')
const express = require('express')
const formidable=require('express-formidable')
const app = express()
require('./config/database').connect()

const PORT = process.env.API_PORT
let verifyToken=require('./middleware/auth')
const student=require('./model/user')
const user=require("./model/user")
const ForgotPassword = require('./model/forgotPassword'); 
const ResetToken = require('./model/resetToken');       
const nodemailer = require('nodemailer');



async function sendResetEmail(email, resetToken) {
    const transporter = nodemailer.createTransport({
      
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_ID,
        pass: 'ehjc Izcx gjbu jvou'
      }
    });
  
    const mailOptions = {
      from: process.env.EMAIL_ID ,
      to: 'schalageri10@gmail.com',
      subject: 'Password Reset',
      text: `Use the following link to reset your password: http://localhost:3000/reset-password/${resetToken}`
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Reset email sent successfully');
    } catch (error) {
      console.error('Error sending reset email:', error);
    }
  }


app.post('/register',formidable(),async function(req,res){
    let {email,password}=req.fields
    if(! ( email && password)){
        res.status(400).send('provide all inputs')
    }
else{

    if(await student.findOne({email})){
        res.send("user already exist")
    }
else{
let enc_password=await bcrypt.hash(password,10)
    let user= await student.create({
       
        email:email,
        password:enc_password});

    let token=jwt.sign({user_id:user._id,email},
        process.env.TOKEN_KEY,
    {expiresIn:"5h"});

user.token=token

    res.json(user)
}




}


 



})

app.post('/login',formidable(),async function(req,res){
    let {email,password}=req.fields
    if(! ( email && password)){
        res.status(400).send('provide all inputs')
    }
else{

    let user= await student.findOne({email})

    if(user && (await bcrypt.compare(password,user.password)))
   {
    let token=jwt.sign({user_id:user._id,email},
        process.env.TOKEN_KEY,
    {expiresIn:"5h"});

user.token=token

res.json(user)


   }  

else{
    res.status(403).send("incorrect usernameor password")
}

}
})



app.post('/forgot-password', formidable(), async function (req, res) {
    const { email } = req.fields;
    
    if (!email) {
      return res.status(400).send('Please provide an email');
    }
  
    const user = await student.findOne({ email });
    
    if (!user) {
      return res.status(404).send('User not found');
    }
  

   
  
    const resetToken = generateResetToken();

    try {
       
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Set expiration date (e.g., 24 hours from now)
        const newResetToken = new ResetToken({
          userId: user._id, 
          resetToken: resetToken,
          expiresAt: expiresAt,
        });
    
       
        await newResetToken.save();




  await sendResetEmail(user.email, resetToken);


    return res.send('Reset token sent successfully');
  }
  catch (error) {
    console.error('Error generating reset token and saving ResetToken:', error);
    return res.status(500).send('Internal server error');
  }
});
  
  
  
  

  
  app.get('/reset-password/:token', async function (req, res) {
    const resetToken = req.params.token;
  
   
    const tokenEntry = await ResetToken.findOne({ token: resetToken });

    if (!tokenEntry) {
      return res.status(404).send('Invalid or expired token');
    }
  
    res.redirect(`/reset-password-form?token=${resetToken}`);
  });

  
  app.post('/reset-password/:token', formidable(), async function (req, res) {
    const resetToken = req.params.token;
    const { newPassword } = req.fields;
  
    if (!newPassword) {
      return res.status(400).send('Please provide a new password');
    }
  
   
    const tokenEntry = await ResetToken.findOne({ token: resetToken });

    if (!tokenEntry) {
      return res.status(404).send('Invalid or expired token');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
  
   
    await student.findOneAndUpdate({ email: tokenEntry.email }, { password: hashedPassword });

  
  await ResetToken.findOneAndDelete({ token: resetToken });

  
    return res.send('Password reset successful');
  });

  function generateResetToken() {
    return require('crypto').randomBytes(32).toString('hex');
  }





app.post('/profile',verifyToken,function(req,res){
    
    res.send("hello user")
});

app.listen(PORT, () => console.log(`Project is running at ${PORT} port`))
