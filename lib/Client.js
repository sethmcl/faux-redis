var events = require('events'),
    util   = require('util');

function Client(server) {
  events.EventEmitter.call(this);

  this.server         = server;
  this.psubscriptions = [];
  this.subscriptions  = [];

  server.on('message', this.onMessageFromServer.bind(this));

  process.nextTick(function () {
    this.emit('connect');
    this.emit('ready');
  }.bind(this));
}

util.inherits(Client, events.EventEmitter);

/**
 * Mock the end API
 */
Client.prototype.end = function () {
};

/**
 * Mock the Redis psubscribe API
 * @param {string} pattern* patterns to subscribe to
 */
Client.prototype.psubscribe = function () {
  var args = Array.prototype.slice.call(arguments, 0).filter(function (arg) {
    return typeof arg === 'string';
  });


  args.forEach(function (pattern) {
    var regExp;

    regExp = new RegExp(
      pattern
        .replace(/^/, '\^')
        .replace(/$/, '\$')
        .replace(/\*/g, '.*')
    );

    this.psubscriptions.push({
      regExp: regExp,
      literal: pattern
     });

  }, this);

};

/**
 * Mock the Redis subscribe API
 * @param {string} channel* channels to subscribe to
 */
Client.prototype.subscribe = function () {
  var channels;

  channels = Array.prototype.slice.call(arguments, 0).filter(function (arg) {
    return typeof arg === 'string';
  });

  channels.forEach(function (channel) {
    if (this.subscriptions.indexOf(channel) === -1) {
      this.subscriptions.push(channelName);
    }
  }, this);
};

/**
 * Mock the Redis publish API
 * @param {string} channel the channel to publish on
 * @param {string} message the message to publish
 */
Client.prototype.publish = function (channel, message) {
  this.server.messageFromClient(channel, message);
};

/**
 * Handle a new message event from server.
 * Check if we have a matching subscription before emitting event.
 * @param {string} channel the channel
 * @param {string} message the message
 */
Client.prototype.onMessageFromServer = function (channel, message) {
  var match, eventArgs, event = 'message';

  // Check explicit channel subscriptions
  match = this.testExplicitSubscriptions(channel);

  if (!match) {
    match = this.testPatternSubscriptions(channel);
    event = 'pmessage';
  }

  if (match) {
    eventArgs = match;
    eventArgs.unshift(event);
    eventArgs.push(message);

    this.emit.apply(this, eventArgs);
  }

};

/**
 * Test if a message matches a normal subscription
 * @param {string} channel the channel the message was sent to
 * @return {Array} array in the form of [channel]
 */
Client.prototype.testExplicitSubscriptions = function (channel) {
  var match = this.subscriptions.indexOf(channel);

  if (match !== -1) {
    return [channel];
  }

  return false;
};

/**
 * Test if a message matches a pattern subscription
 * @param {string} channel the channel the message was sent to
 * @return {Array} array in the form of [pattern, channel] where pattern is the literal pattern that
 *  matched
 */
Client.prototype.testPatternSubscriptions = function (channel) {
    var match;

    this.psubscriptions.some(function (pattern) {
        var regExp = pattern.regExp;

        if (regExp.test(channel)) {
            match = [pattern.literal, channel];
            return true;
        }

    });

    return match;
};

module.exports = Client;
