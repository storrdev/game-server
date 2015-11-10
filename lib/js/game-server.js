// js/game-server.js

define([
	'socketio',
	'../eventemitter',
	'../peer-server'
], function(io, EventEmitter) {
	console.clear();

	var socket, peer;
	var players = [];
	
	function GS() {
		EventEmitter.call(this);
	}

	GS.prototype = Object.create(EventEmitter.prototype);

	GS.prototype.constructor = GS;

	/*
	*	Methods
	*/

	// Connect method
	GS.prototype.connect = function(cb) {

		var that = this;	// For accessing "emit" method

		// Connect to server via websockets
		socket = io();

		// Websocket connection made with server
		socket.on('connect', function() {
			console.log('connected to server via websockets with id: %s', socket.io.engine.id);
			// socketConnected(true);

			// Connect to PeerServer
			// console.log('attempting to connect to peer server');
			peer = new Peer({ host: 'localhost', port: 3000, path: '/peerjs' });

			// PeerServer events

			// PeerServer connection made with server
			peer.on('open', function(id) {
				console.log('Connected with PeerServer successfully.');
				// peerServerConnected(true, id);

				var player = {
					socketId: socket.io.engine.id,
					peerId: id
				};

				// console.log('Sending player info to server.');
				socket.emit('new player', player);
			});

			peer.on('connection', function(conn) {
				console.log('Connected Via WebRTC to player with id: %s', conn.peer);

				// Emit new peer event
				that.emit('new peer', conn.peer);

				// Peer events
				conn.on('data', function(data) {
					if (typeof data.text !== 'undefined') {
						console.log('data recieved');
						console.log(data);
					}
					that.emit('peer data', data);
				});
			});

			peer.on('error', function(err) {
				console.log(err);
			});
		});

		// // socket.io events

		socket.on('new player', function(player) {
			console.log('"new player" socket message recieved.');

			addPlayer(player);

		});

		socket.on('all players', function(players) {
			console.log('all players received');

			players.forEach(function(player, index){
				// Checks to make sure we aren't adding ourselves to the players array
				if (player.socketId != socket.io.engine.id) {
					addPlayer(player);
				}
			});
		});

		socket.on('remove player', function(id) {
			console.log('user disconnected with id: %s', id);

			removePlayerBySocketId(id);
		});

		cb();
	};

	// Send Method

	GS.prototype.send = function(data) {
		players.forEach(function(player, index){
			player.peerConn.send(data);
		});
	};

	return GS;

	// Rando functions

	// Player functions

	function addPlayer(player) {
		
		// Make WebRTC dataConnection with new player
		player.peerConn = peer.connect(player.peerId);
		player.peerConn.on('open', function() {
			this.send({
				text: 'connection made with player'
			});
		});

		players.push(player);

		// var numPlayers = DOM.playersTable.getElementsByTagName('tr').length;

		// var row = DOM.playersTable.insertRow(numPlayers);
		// row.id = player.socketId;
		// var socketId = row.insertCell(0);
		// var peerId = row.insertCell(1);
		// var connected = row.insertCell(2);
		// connected.id = player.peerId;

		// socketId.innerHTML = player.socketId;
		// peerId.innerHTML = player.peerId;
		// connected.innerHTML = 'false';
		
		// Make WebRTC dataConnection with new player
		// var conn = peer.connect(player.peerId);
		// conn.on('open', function() {
		// 	conn.send({
		// 		text: 'connection made with player'
		// 	});
		// });
	}

	function removePlayerBySocketId(id) {
		var playerIndex = null;
		for(i = 0; i < players.length; i++) {
			if (id == players[i].socketId) {
				playerIndex = i;
			}
		}

		if (playerIndex != null) {
			players.splice(playerIndex, 1);

			// Delete player row in table
			var playerRow = document.getElementById(id);
			if (playerRow) {
				playerRow.parentNode.removeChild(playerRow);
			}

			console.log('Player removed from players array with id: %s', id);
		}
		else {
			console.log('No player in players array with socket id: %s', id);
		}
	}

});