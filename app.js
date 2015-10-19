var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ExpressPeerServer = require('peer').ExpressPeerServer;

// Server Setup

var socket;	// Make socket object available outside of the io.on('connection') event function
var playerId = 1; 
var players = [];

// Setup Static File Directory
app.use(express.static('public'));

// Start server on heroku specified port or 3000 if on localhost
var port = process.env.PORT || 3000; // Heroku Only
var server = http.listen(port, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});

// Create a PeerJS Server
// Request webrtc dataconnection from the /peerjs route.
var peerServer = ExpressPeerServer(server, { debug: true });
app.use('/peerjs', peerServer);

// Socket.io events

io.on('connection', function(s) {
	socket = s;	// Make s object available outside of this function

	console.log('a user connected through websockets with id: %s', socket.id);

	// Player disconnect handler
	socket.on('disconnect', function(u) {
		console.log('a user disconnected through websockets with id: %s', socket.id);
		// console.log(u);
	});

	socket.on('manual disconnect', function() {
		socket.disconnect();
	});
});

// Peer events

peerServer.on('connection', function(id) {
	console.log('peerserver connection made with id: %s', id);

	var player = {
		id: playerId,
		socketId: 0,
		connId: id
	};
	players.push(player);
	playerId++;

	socket.broadcast.emit('new player', player);
});

peerServer.on('disconnect', function(id) {
	console.log('peer disconnected with id: %s', id);
});

// Routes

app.get('/admin', function(req,res){
	res.sendFile(__dirname + '/public/admin.html');
}); 
