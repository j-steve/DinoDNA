var express = require('express');
var router = express.Router();
////"dropzone": "~4.3.0"

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'DinoDNA' });
  
});

module.exports = router;
