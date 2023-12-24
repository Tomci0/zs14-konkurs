var express = require('express');
var router = express.Router();
const passport = require('passport');
const { getMyConsultations } = require('../libs/consulations');

router.get('/', async function(req, res, next) {
    res.render('index/consultations', { 
        userData: req.user || false,
        userConsultations: req.user && await getMyConsultations(req.user._id) || null
    });
});

module.exports = router;