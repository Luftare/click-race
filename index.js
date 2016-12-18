var port = 8001;

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get("/", (req,res) => {
  res.sendFile(__dirname + '/client/index.html');
});

app.use('/',express.static(__dirname +'/client'));

http.listen(port, function(){
  console.log('listening port:'+port);
	startState(GAME);
});

var players = [];
var sockets = {};

var state = "game";
var serverUpdateDt = 1000;
var SCORES = "scores";
var GAME = "game";
var stateTimes = {
	game: 5000,
	scores: 3000
};
var stateTimeout;

io.sockets.on("connection", function (socket) {
	sockets[socket.id] = socket;

	socket.on("login", function (data) {
		socket.player = {
			id: socket.id,
			points: 0,
			rank: 0,
			car: data.car,
			name: data.name
		};
		players.push(socket.player);
		socket.emit("init_game",{
			players: players
		});
		socket.broadcast.emit("player_connected",socket.player);
	});

	socket.on("client_update", function (data) {
		socket.player.points = data.points;
	});

	socket.on("disconnect", function () {
		io.sockets.emit("player_disconnected",socket.player);
		delete sockets[socket.id];
		for (var i = 0; i < players.length; i++) {
			if(players[i].id === socket.id){
				players.splice(i,1);
				return;
			}
		}
	});


});

setInterval(function () {
	io.sockets.emit("game_update",players);
},serverUpdateDt);

function startState(stateName){
	state = stateName;
	console.log("entering state: ",stateName)
	stateTimeout = setTimeout(function () {
		if(state === GAME){
		//	startState(SCORES);
		}
		else if(state === SCORES){
	//		startState(GAME);
		}
	},stateTimes[stateName]);
}
