var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ExpressPeerServer = require('peer').ExpressPeerServer;
var fs = require('fs');

// Server Setup
var server, peerServer;
var playerId = 1;
var players = [];

// Logger Setup
var logger = function(msg) {
	if (process.env.NODE_ENV != 'test') {
		console.log(msg);
	}
}

var start = exports.start = function start(port, callback) {
	if (process.env.PORT) {
		port = process.env.PORT;
	}
	else {
		if (typeof port == 'function' || typeof port == 'undefined') {
			logger('No port defined for app, defaulting to 3000');
			port = 3000;
		}
	}
	
	server = http.listen(port, function() {
		var host = server.address().address;
		var port = server.address().port;

		logger('Example app listening at http://' + host + ':' + port);

		// Create a PeerJS Server
		// Route requests to /peerjs to the PeerJS Server.
		var options = { debug: true };
		peerServer = ExpressPeerServer(server, options);
		app.use('/peerjs', peerServer);

		// Peer events
		peerServer.on('connection', function(id) {
			logger('peerserver connection made with id: ' + id);
		});

		peerServer.on('disconnect', function(id) {
			logger('peer disconnected with id: ' + id);
		});

		if (typeof callback == 'function') {
			callback();
		}
	});
};

var stop = exports.stop = function stop(callback) {
	server.close(callback);
};

// Setup Static File Directory
app.use(express.static('public'));

// // Start server on heroku specified port or 3000 if on localhost
// var port = process.env.PORT || 3000; // Heroku Only

// Socket.io events
io.on('connection', function(socket) {
	// socket = s;	// Make s object available outside of this function

	logger('websocket connection made with id: ' + socket.id);

	// Player disconnect handler
	socket.on('disconnect', function(u) {
		logger('a user disconnected through websockets with id: ' + socket.id);
		
		logger(u);

		removePlayerBySocketId(socket.id);

		io.emit('remove player', socket.id);
	});

	socket.on('manual disconnect', function() {
		socket.disconnect();
	});

	socket.on('new player', function(player) {
		logger('new player :');
		logger(player);

		players.push(player);

		socket.emit('all players', players);

		// Send new player's info to all already connect players.
		socket.broadcast.emit('new player', player);
	});
});

// Routes

app.get('/debug', function(req, res) {
	res.sendFile(__dirname + '/public/debug.html');
});

app.get('/admin', function(req,res){
	res.sendFile(__dirname + '/public/admin.html');
}); 

app.get('/admin/players', function(req, res) {
	res.json(players);
});

app.get('/game-server.js', function(req, res) {

	/*
	*	Read and combine any 3rd party client side scripts so we can serve
	* 	just one js file: game-server.js
	*/

	fs.readFile(__dirname + '/node_modules/socket.io/node_modules/socket.io-client/socket.io.js', 'utf-8', function(err, socket) {
		if (err) throw err;
		fs.readFile(__dirname + '/node_modules/peerjs/dist/peer.min.js', 'utf-8', function(err, peerFile) {
			if (err) throw err;
			fs.readFile(__dirname + '/lib/js/game-server.js', 'utf-8', function(err, gameFile) {
				if (err) throw err;

				res.set('Content-Type', 'application/javascript');

				var clientJs = socket + '\n\n' + peerFile + '\n\n' + gameFile;

				res.send(clientJs);
			});
		});
	});
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
		logger('Player removed from players array with id: ' + id);
	}
	else {
		logger('No player in players array with socket id: ' + id);
	}
}

// Exports
exports.app = app;