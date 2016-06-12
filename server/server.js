var express   = require('express');
var app       = express();
var socketio  = require('socket.io');
var runningPortNumber = process.env.PORT || 8080;
var server    = app.listen(runningPortNumber);
var io        = require('socket.io').listen(server);

// allow CORS
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

// sockets configuration
// if a sausage is thrown, hittarget will be emited to all clients, which in turn executes the target animation and sausage animation for the desktop
io.sockets.on('connection', function (socket) {
  console.log("sockets");
  socket.on('throwsausage', function() {
    console.log("sausage thrown");
    io.sockets.emit('hittarget');
  });
});

// get the app and display it
app.use(express.static(__dirname + '/'));
console.log('listening on ' + runningPortNumber);
