const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

router.get('/register', (req,res) =>{
    res.render('users/register');
});

router.post('/register', catchAsync (async (req,res) => {
    try { 
        const { password, email, username }  = req.body;
        console.log(password,username,email);
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        console.log(registeredUser);
        req.flash("success", "Welcome to Yelp Camp!");
        res.redirect('/campgrounds');
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('register')
    }
}));

router.get('/login', (req,res) => {
    res.render('users/login')
});

router.post('/login', async (req,res) => {
    
});


module.exports  = router;