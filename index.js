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

var sockets = {};

var players = [];
var boosts = [];

var state = "game";
var serverUpdateDt = 1000;
var SCORES = "scores";
var GAME = "game";
var boostIdCounter = 1;
var stateTimes = {
	game: 5000,
	scores: 3000
};
var stateTimeout;

var boostsLibrary = [
	["boost00","boost10","boost20","boost30"],
	["boost21","boost31","boost41"],
	["boost42","boost52"],
	["boost53"]
];


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
			players: players,
			boosts: boosts
		});
		socket.broadcast.emit("player_connected",socket.player);
	});

	socket.on("client_update", function (data) {
		if(socket.player && socket.player.points){
				socket.player.points = data.points;
		}
	});

	socket.on("request_boost", function (boost,cb) {
		cb("HELLO!");
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

function createBoost(){
	var weightedRand = Math.pow(Math.random(),6);
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
	if(boosts.length < 3){
		var boost = createBoost();
		boosts.push(boost);
		io.sockets.emit("boost_spawn",players);
	}
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
