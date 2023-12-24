var express = require('express');
var router = express.Router();

/* GET users listing. */

router.get('/', function(req, res, next) {
    res.json({
        "info": "API for ZS14 Consultations Page",
        "version": "0.0.1",
        "author": "tomcio.space",
        "copy": "tomcio.space © " + new Date().getFullYear() 
    });
});

module.exports = router;