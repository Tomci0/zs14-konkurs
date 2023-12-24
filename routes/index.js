var express = require('express');
var router = express.Router();
const { getMyConsultations } = require('../libs/consulations');

router.get('/', async function(req, res, next) {
    res.render('index/index', { 
        userData: req.user || false,
        userConsultations: req.user && await getMyConsultations(req.user._id) || null,
    });
});

module.exports = router;