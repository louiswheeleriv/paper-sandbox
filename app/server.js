var express = require('express');
var app = express();
var router = express.Router();

var portNumber = 3000;

// Print requests as they come in
router.use(function(req, res, next) {
    console.log(req.method, req.url);
    next();
});

// Route for home
router.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

// Specify routing
app.use('/', router);

// Specify resource directories
app.use(express.static(__dirname + '/../bower_components'));
app.use(express.static(__dirname + '/../node_modules'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/images'));

// Print message and start listening
app.listen(portNumber);
console.log('Server running on port ' + portNumber + '...');
