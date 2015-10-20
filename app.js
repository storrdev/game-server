var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ExpressPeerServer = require('peer').ExpressPeerServer;

// Server Setup
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
// Route requests to /peerjs to the PeerJS Server.
var options = { debug: true };
var peerServer = ExpressPeerServer(server, options);
app.use('/peerjs', peerServer);

// Socket.io events
io.on('connection', function(socket) {
	// socket = s;	// Make s object available outside of this function

	console.log('websocket connection made with id: %s', socket.id);

	// Player disconnect handler
	socket.on('disconnect', function(u) {
		console.log('a user disconnected through websockets with id: %s', socket.id);
		
		console.log(u);

		removePlayerBySocketId(socket.id);

		io.emit('remove player', socket.id);
	});

	socket.on('manual disconnect', function() {
		socket.disconnect();
	});

	socket.on('new player', function(player) {
		console.log('new player :');
		console.log(player);

		players.push(player);

		socket.emit('all players', players);

		// Send new player's info to all already connect players.
		socket.broadcast.emit('new player', player);
	});
});

// Peer events

peerServer.on('connection', function(id) {
	console.log('peerserver connection made with id: %s', id);
});

peerServer.on('disconnect', function(id) {
	console.log('peer disconnected with id: %s', id);
});

// Routes

app.get('/admin', function(req,res){
	res.sendFile(__dirname + '/public/admin.html');
}); 

app.get('/admin/players', function(req, res) {
	res.json(players);
});

// Player Functions

function removePlayerBySocketId(id) {
	var playerIndex = null;
	for(i = 0; i < players.length; i++) {
		if (id == players[i].socketId) {
			playerIndex = i;
		}
	}

	if (playerIndex != null) {
		players.splice(playerIndex, 1);
		console.log('Player removed from players array with id: %s', id);
	}
	else {
		console.log('No player in players array with socket id: %s', id);
	}
}

// Exports
exports.app = app;