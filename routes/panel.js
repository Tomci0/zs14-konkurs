var express = require('express');
var router = express.Router();
const { isTeacher } = require('../middleware/auth');

router.get('/', isTeacher, function(req, res, next) {
    res.render('panel/index', { 
        userData: req.user,
    });
});

router.get('/my-consultations', isTeacher, function(req, res, next) {
    res.render('panel/my-consultations', {
        userData: req.user,
    })
});

router.get('/my-consultations/:id', isTeacher, function(req, res, next) {
    res.render('panel/consultations-details', {
        userData: req.user,
    })
});

module.exports = router;