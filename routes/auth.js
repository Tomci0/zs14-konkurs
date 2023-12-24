var express = require('express');
var router = express.Router();
const passport = require('passport');

router.get('/', passport.authenticate('google', {
    // hd: 'chmura.zs14.edu.pl',
    scope: ['profile', 'email']
}));

router.get('/callback', passport.authenticate('google', { failureRedirect: '/' }), function(req, res) {
    req.flash('success', 'Pomyślnie zalogowano!');
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout(() => {
        res.redirect('/');
    });
});

module.exports = router;