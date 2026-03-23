const express = require('express');
const passport = require('passport');
const router = express.Router();

//@desc Auth with google
//@route GET /api/auth/google

router.get('/google' ,passport.authenticate('google',{scope:['profile' , 'email']}));

res.redirect('https://railbook-frontend.vercel.app/dashboard');

router.get('/logout' ,(req,res)=>{
    req.logOut(()=>{
        res.redirect('http://localhost:3000');
    });
});

router.get('/login/success' ,(req,res)=>{
    if(req.user){
        res.status(200).json({
            success:true,
            message: "user has successfully authenticated",
            user:req.user,
        });
    }else{
        res.status(403).json({success:false , message:"Not Authorized"});
    }
});

module.exports = router;