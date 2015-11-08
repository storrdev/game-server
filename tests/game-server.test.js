// tests/peer-server.test.js

process.env.NODE_ENV = 'test';

var expect = require('chai').expect;
var request = require('superagent');

describe('Game Server', function() {
	var myApp = require('../app.js');
	var port = 3000;
	var baseUrl = 'http://localhost:' + port;

	before(function(done) {
		myApp.start(port, done);
	});

	after(function(done) {
		myApp.stop(done);
	});

	describe('when requested at /peerjs', function() {
		it('should return an object describing itself', function(done) {
			request.get(baseUrl + '/peerjs').end(function assert(err, res) {
				expect(err).to.not.be.ok;
				expect(res).to.have.property('status', 200);
				expect(JSON.parse(res.text)).to.have.property('name', 'PeerJS Server');
				done();
			});
		});
	});

	describe('when requested at /debug', function() {
		it('should display the debug.html page', function(done) {
			request.get(baseUrl + '/debug').end(function assert(err, res) {
				expect(err).to.not.be.ok;
				expect(res).to.have.property('status', 200);
				done();
			});
		});
	});

	describe('when requested at /admin/players', function() {
		it('should return an array of all currently connected players', function(done) {
			request.get(baseUrl + '/admin/players').end(function assert(err, res) {
				expect(err).to.not.be.ok;
				expect(res).to.have.property('status', 200);
				expect(res).to.be.instanceOf(Array);
				done();
			});
		});
	})
});