/*=======================
   Tweetmap - app.js
   Nick Molina - 2013
========================= */

/*=====================
   Module Dependencies
====================== */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , url = require('url')
  , request = require('request')
  , socket = require('socket.io')
  , twit = require('twit');

/*======================
  Express configuration 
========================*/

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

/*======================
  Twitter configuration 
========================*/

var T = new twit({
    consumer_key:         '5Cx1C6u27PRq3I7u2tk1gg'
  , consumer_secret:      'nsryfnWKLaGF0m0gQpokQh1HJw0o3JIyyl3gQaPFc'
  , access_token:         '265707349-1bkUknUYk26IIeHOzxecNN7uSWbalkr8HhQxey7X'
  , access_token_secret:  'itGOqhtZXDENoGjExU5W2ORps0xuCozMEuhHLYFN4I'
})

/*======================	
  Sever Initialization
========================*/

var server = http.createServer(app);
var io = socket.listen(server);

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

/*============================================	
  Pull location from map, query Twitter Stream
==============================================*/

var tweetCount = 0;
io.sockets.on('connection', function(socket){
	console.log('Client connected...');
	socket.on('brushed', function(location){
		console.log(location);
		var stream = T.stream('statuses/filter', { locations: location})
		stream.on('tweet', function(tweet){
			tweetCount++;
			console.log("tweet: ", tweetCount);
			socket.emit('renderTweets', strencode(tweet));
			if(tweetCount >= 8)
			{
				stream.stop();
				tweetCount = 0;
			}
		});
	});
}); 

/*============================================	
 	  Handle text-frame decoding Errors
==============================================*/

function strencode( data ) {
  return unescape( encodeURIComponent( JSON.stringify( data ) ) );
}


/*============================================	
 	 			  Run Server
==============================================*/

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


