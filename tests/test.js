// tests/test.js

var expect = require('chai').expect;
var request = require('superagent');

describe('Game Server App', function() {
	var myApp = require('../app.js');
	var port = 3000;
	var baseUrl = 'http://localhost:' + port;

	before(function(done) {
		myApp.start(port, done);
	});

	after(function(done) {
		myApp.stop(done);
	});

	describe('when requested at peerjs', function() {
		it('it should return an object describing itself', function(done) {
			request.get(baseUrl + '/peerjs').end(function assert(err, res) {
				expect(err).to.not.be.ok;
				expect(res).to.have.property('status', 200);
				expect(res.text).to.equal('Hello World!');
				done();
			});
		});
	});
});