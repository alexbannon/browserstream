'use strict';

var express = require('express');
var router = express.Router();
var controller = require('./title.controller');

router.get('/:id?', controller.index);

module.exports = router;
