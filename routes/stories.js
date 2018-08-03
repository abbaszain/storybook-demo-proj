const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authHelper = require('../helpers/auth');
const User = mongoose.model('user');
const Story = mongoose.model('stories');

router.get('/add', authHelper.ensureAuthenticated, (req, res) => {
    res.render('stories/add');
});

router.get('/edit/:id', authHelper.ensureAuthenticated, (req, res) => {
    Story.findOne({
            _id: req.params.id
        })
        .then(story => {
            if(story.user != req.user.id){
                res.redirect('/stories');
            }else{
                res.render('stories/edit', {
                    story: story
                });
            }
        });
});

router.get('/', (req, res) => {
    Story.find({
            status: 'public'
        })
        .populate('user')
        .sort({date: 'desc'})
        .then(stories => {
                res.render('stories/index', {
                stories
            });
        })
})

router.get('/show/:id', (req, res) => {
    Story.findOne({
            _id: req.params.id
        })
        .populate('user')
        .populate('comments.commentUser')
        .then(story => {
            if(story.status == 'public'){
                res.render('stories/show', {
                    story
                })
            } else{
                if(req.user){
                    if(story.user.id == req.user._id){
                        res.render('stories/show', {
                            story
                        })
                    }else{
                        res.redirect('/stories');
                    }
                }else{
                    res.redirect('/stories');
                }
            }
        })
})
// Process Form
router.post('/', (req, res) => {
    let allowComments;
    if (req.body.allowComments) {
        allowComments = true;
    } else {
        allowComments = false;
    }
    const newStory = {
        title: req.body.title,
        body: req.body.body,
        status: req.body.status,
        allowComments: allowComments,
        user: req.user.id
    }
    new Story(newStory)
        .save()
        .then(story => {
            res.redirect(`/stories/show/${story.id}`);
        });
})

// Add comment

router.post('/comment/:id', (req,res)=> {
    Story.findOne({_id: req.params.id})
    .then(story => {
        const newComment = {
            commentBody: req.body.commentBody,
            commentUser: req.user.id
        }

        // Push to comments array
        story.comments.unshift(newComment);

        story.save()
        .then(story => {
            res.redirect(`/stories/show/${story.id}`);
        });
    })
})
// Edit story
router.put('/:id', (req, res) => {
    Story.findOne({
            _id: req.params.id
        })
        .then(story => {
            let allowComments;
            if (req.body.allowComments) {
                allowComments = true;
            } else {
                allowComments = false;
            }
            story.title = req.body.title;
            story.body = req.body.body;
            story.status = req.body.status;
            story.allowComments = allowComments;
            console.log(story);
            story.save()
                .then(story => {
                    res.redirect('/dashboard');
                })
        });
})

router.delete('/:id', (req,res) => {
    Story.remove({
        _id: req.params.id
    })
    .then(() => {
     res.redirect('/dashboard');
    })
})

// Stories from a specific user
router.get('/user/:userId', (req,res) => {
    Story.find({
        user: req.params.userId,
        status: 'public'
    })
    .populate('user')
    .then(stories => {
        res.render('stories/index', {
            stories: stories
        });
    })
})

// Personal stories
router.get('/my', authHelper.ensureAuthenticated, (req,res) => {
    Story.find({
        user: req.user.id
    })
    .populate('user')
    .then(stories => {
        res.render('stories/index', {
            stories: stories
        });
    })
})
module.exports = router;