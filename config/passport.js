const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('./keys');

//Load models 
const User = mongoose.model('user');

module.exports = function(passport){
    passport.use(new GoogleStrategy({
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: "/auth/google/callback",
        proxy: true
    },
    (accessToken, refreshToken, profile, done) => {
        image = profile.photos[0].value.substring(0, profile.photos[0].value.indexOf('?'));
        const newUser = {
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            googleID: profile.id,
            image: image,
            email: profile.emails[0].value
        }
        User.findOne({
            googleID: newUser.googleID
        })
        .then(user => {
            if(user){
              return done(null, user);
            }
            else{
                new User(newUser)
                .save()
                .then(user => done(null,user));
            }
        })
    }))

    passport.serializeUser((user,done)=> {
        done(null,user.id);
    });
    passport.deserializeUser((id,done)=> {
        User.findById(id, (err,user) =>{
            done(err,user);
        })
    });
}