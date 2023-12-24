const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const teachers = require('../configs/teachers');
const config = require('../configs/config');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.VERSION == 'STAGE'?'http://localhost:8000/auth/callback':config.URL + '/auth/callback',
    }, 
    function(accessToken, refreshToken, profile, done) {
        const isTeacher = teachers.includes(profile.emails[0].value);
        User.findOne({ googleId: profile.id}).then((currentUser) => {
            if (currentUser) {
                User.updateOne({ googleId: profile.id }, { avatar: profile.photos[0].value, role: isTeacher ? 1 : 0 }).then((updatedUser) => {
                    console.log('User updated');
                });

                currentUser = currentUser.toObject();
                currentUser.avatar = profile.photos[0].value;
                currentUser.isTeacher = isTeacher;
                currentUser.role = 1;

                return done(null, currentUser);
            } else {
                new User({
                    googleId: profile.id,
                    name: profile.displayName,
                    mail: profile.emails[0].value,
                    avatar: profile.photos[0].value,
                    role: isTeacher ? 1 : 0
                }).save().then((newUser) => {
                    newUser = newUser.toObject();
                    newUser.isTeacher = isTeacher;
                    return done(null, newUser);
                });
            }
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user)
});