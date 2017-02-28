'use strict';

var express = require('express');
var router = express.Router();
var controller = require('./search.controller');

router.get('/:search?', controller.index);

module.exports = router;
