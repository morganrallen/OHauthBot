
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');

var bot = require("./bot")({
  server: "irc.freenode.net",
  name: "OHauthBot"
});

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.cookieSession({secret: "DERP!"}));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get("/auth", function(req, res) {
  console.log(req);
  var username = req.url.match(/username=(.*)/);
  if(username === null) {
    res.end("Enter username");
  } else {
    bot.tryAuth(username[1], function(err, userInfo) {
      if(err) {
        res.end(err);
      } else {
        // user was online, registered and indented
        req.session.userInfo = userInfo;
        res.end("Link being sent");
        bot.sendLink(username[1], "http://localhost:3000/userInfo/"+Math.random()*1000);
      }
    });
  }
});

app.get("/userInfo/:guid", function(req, res) {
  res.end("Welcome, "+req.session.userInfo.realname);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
