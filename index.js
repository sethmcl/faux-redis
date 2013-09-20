var Client = require('./lib/Client'),
    Server = require('./lib/Server');

module.exports = {
  servers: {},
  createClient: function (port, host, options) {
    var serverUrl, server;

    serverUrl = [host, ':', port].join('');
    server    = this.servers[serverUrl];

    if (!server) {
      this.servers[serverUrl] = server = new Server();
    }

    return new Client(server);
  }
};
