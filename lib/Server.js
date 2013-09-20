var events = require('events'),
    util   = require('util');

function Server() {
  events.EventEmitter.call(this);
}

util.inherits(Server, events.EventEmitter);

/**
 * Receive message from client
 * @param {string} channel channel name
 * @param {string} message the message
 */
Server.prototype.messageFromClient = function (channel, message) {
  this.emit('message', channel, message);
};

module.exports = Server;
