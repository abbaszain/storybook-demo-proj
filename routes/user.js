const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authHelper = require('../helpers/auth');
const Story = mongoose.model('stories');
const User = mongoose.model('user');

router.get('/', authHelper.ensureGuest, (req,res) => {
    res.render('index/welcome');
})

router.get('/dashboard',authHelper.ensureAuthenticated, (req,res)=> {
    Story.find({user: req.user.id})
    .then(stories => {
        res.render('index/dashboard', {
            stories
        })
    })
});

router.get('/about', (req,res)=> {
    res.render('index/about');
});

module.exports = router;