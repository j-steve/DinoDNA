var express = require('express');
var router = express.Router();

var React = require('react');
var ReactDOMServer = require('react-dom/server');
var Dino = require('../src/js/common/components/Dino');

// Transpiled ES6 may export components as { default: Component }
Dino = Dino.default || Dino;

////"dropzone": "~4.3.0"

/* GET home page. */
router.get('/', function(req, res, next) {
	var html = ReactDOMServer.renderToString(<Dino />);

  res.render('index', {
  	title: 'DinoDNA',
  	reactOutput: html
  });
});

module.exports = router;
