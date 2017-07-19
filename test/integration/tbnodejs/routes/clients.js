var express = require('express');
var router = express.Router();
var tbNode = require('tubular-nodejs')('jsondata');
var data = require('../public/sources/clients.json');

/* POST clients listing. */
router.post('/', function (req, res, next) {
    tbNode.createGridResponse(req.body, data).then(function(response){
        return res.json(response);
    })
});

module.exports = router;
