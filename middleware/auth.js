let auth = {
    isLoggedIn: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error', 'Musisz najpierw się zalogować!')
        res.redirect('/');
    },
    isTeacher: (req, res, next) => {
        if (!req.isAuthenticated()) {
            req.flash('error', 'Musisz najpierw się zalogować!');
            return res.redirect('/');
        }
        if (!req.user.isTeacher) {
            req.flash('error', 'Nie masz uprawnień do tej strony!');
            return res.redirect('/');
        }
    
        return next();
    }
}

module.exports = auth;