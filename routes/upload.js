var express = require('express');
var router = express.Router();
////"dropzone": "~4.3.0"

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('upload', { title: 'DinoDNA' });
  
});

module.exports = router;
