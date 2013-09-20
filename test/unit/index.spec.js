var faux = require('../../');

describe('faux-redis', function () {

  it('should have createClient() method', function () {
    faux.createClient.should.be.a('function');
  });

  describe('psubscribe', function () {
    it('should subscribe and receive messages', function (done) {
      var client1 = faux.createClient(),
          client2 = faux.createClient();

      client2.psubscribe('fast:*');
      client2.on('pmessage', function (pattern, channel, message) {
        pattern.should.equal('fast:*');
        channel.should.equal('fast:forward');
        message.should.equal('hi');
        done();
      });

      client1.publish('fast:forward', 'hi');

    });
  });


});
