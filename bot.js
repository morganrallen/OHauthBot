var irc = require("irc");

module.exports = function(config) {
  var connected = false;

  var client = new irc.Client(config.server, config.name, config);

  var responseQueue = {};

  client.addListener("notice", function(from, to, message) {
    if(from === "NickServ") {
      message = message.split(" ");
      var idented = parseInt(message.pop(), 10);
      var username = message.shift();
      if(idented !== 3) {
        responseQueue[username]({msg: "Not Identified"}, null);
        delete responseQueue[username];
      } else {
        client.whois(username, function(info) {
          responseQueue[username](null, info);
          delete responseQueue[username];
        });
      };
    }
  });

  client.addListener("error", function(message) {
    console.log("ERROR: ", message);
  });

  var queue = [];

  client.addListener("registered", function(message) {
    connected = true;
    while(queue.length > 0) {
      module.exports.tryAuth.apply(module, queue.pop());
    };
  });

  return {
    sendLink: function(username, url) {
      client.say(username, "Visit URL to continue login. " + url);
    },
    tryAuth: function(username, cb) {
      if(!connected) {
        return queue.push([username, cb]);
      }

      responseQueue[username] = cb;
      client.say("nickserv", "ACC " + username);
    }
  };
}
