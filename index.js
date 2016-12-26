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
	state = GAME;
});

var sockets = {};

var players = [];
var boosts = [];

var state = "game";
var serverUpdateDt = 100;
var SCORES = "scores";
var GAME = "game";
var boostIdCounter = 1;
var stateTimes = {
	game: 5000,
	scores: 1000
};
var stateTimeout;
var connectionsCount = 0;

var boostsLibrary = [
	["boost00","boost10","boost20","boost30"],
	["boost21","boost31","boost41"],
	["boost42","boost52"],
	["boost53"]
];


io.sockets.on("connection", function (socket) {
  connectionsCount++;
	sockets[socket.id] = socket;

	socket.on("login", function (data,cb) {
		socket.player = {
			id: socket.id,
			points: 0,
			rank: 0,
			car: data.car,
			name: data.name
		};
		cb();
		players.push(socket.player);
		socket.emit("init_game",{
			players: players,
			boosts: boosts,
      serverDt: serverUpdateDt
		});
		socket.broadcast.emit("player_connected",socket.player);
	});

	socket.on("client_update", function (data) {
		if(socket.player && socket.player){
				socket.player.points = data.points;
		}
	});

	socket.on("request_boost", function (boost,cb) {
		var isSuccess = false;
		for (var i = 0; i < boosts.length; i++) {
			if(boosts[i].id === boost.id){
				isSuccess = true;
				boosts.splice(i,1);
				break;
			}
		}
		cb(isSuccess);
		if(isSuccess) socket.broadcast.emit("remove_boost",boost);
	});

	socket.on("request_victory", function () {
		if(state === GAME){
			state === SCORES;
			//game over, you win!
			io.sockets.emit("to_scores",players);
			setTimeout(function () {
				for (var i = 0; i < players.length; i++) {
					players[i].points = 0;
				}
				io.sockets.emit("init_game",{
					players: players,
					boosts: boosts,
          serverDt: serverUpdateDt
				});
			},players.length*2000+3000)
		}
	});

	socket.on("disconnect", function () {
    connectionsCount--;
		io.sockets.emit("player_disconnected",socket.player);
		delete sockets[socket.id];
		for (var i = 0; i < players.length; i++) {
			if(players[i].id === socket.id){
				players.splice(i,1);
				return;
			}
		}
    if(connectionsCount === 0){
      players = [];
      sockets = {};
    }
	});

});

function createBoost(){
	var weightedRand = Math.pow(Math.random(),2);
	var rarity = Math.floor(weightedRand*boostsLibrary.length);
	var rarityCount = boostsLibrary[rarity].length;
	var boostIndex = Math.floor(Math.random()*rarityCount);

	var add = rarity*2 + 1;

	return {
		name: boostsLibrary[rarity][boostIndex],
		value: add,
		id: boostIdCounter++
	};
}

setInterval(function () {//gameloop
	if(state !== GAME) return;
	if(boosts.length < 3){
		var boost = createBoost();
		boosts.push(boost);
		io.sockets.emit("boost_spawn",boost);
	}
	io.sockets.emit("game_update",players);
},serverUpdateDt);
