const port = process.env.PORT || 80;

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use('/', express.static(__dirname + '/client'));

http.listen(port, () => {
  console.log('listening port:' + port);
});

const SERVER_UPDATE_DT = 100;
const STATE_SCORES = 'scores';
const STATE_GAME = 'game';

let sockets = {};
let players = [];
let boosts = [];
let state = STATE_GAME;
let boostIdCounter = 1;
let stateTimeout;
let connectionsCount = 0;

const boostsLibrary = [
  ['boost00', 'boost10', 'boost20', 'boost30'],
  ['boost21', 'boost31', 'boost41'],
  ['boost42', 'boost52'],
  ['boost53'],
];

io.sockets.on('connection', function(socket) {
  connectionsCount++;
  sockets[socket.id] = socket;

  socket.on('login', function(data, cb) {
    socket.player = {
      id: socket.id,
      points: 0,
      rank: 0,
      car: data.car,
      name: data.name,
    };
    cb();
    players.push(socket.player);
    socket.emit('init_game', {
      players: players,
      boosts: boosts,
      serverDt: SERVER_UPDATE_DT,
    });
    socket.broadcast.emit('player_connected', socket.player);
  });

  socket.on('client_update', function(data) {
    if (socket.player && socket.player) {
      socket.player.points = data.points;
    }
  });

  socket.on('request_boost', function(boost, cb) {
    let isSuccess = false;
    for (let i = 0; i < boosts.length; i++) {
      if (boosts[i].id === boost.id) {
        isSuccess = true;
        boosts.splice(i, 1);
        break;
      }
    }
    cb(isSuccess);
    if (isSuccess) socket.broadcast.emit('remove_boost', boost);
  });

  socket.on('request_victory', () => {
		if(state !== STATE_GAME) return;

		state = STATE_SCORES;
		io.sockets.emit('to_scores', players);

		setTimeout(function() {
			state = STATE_GAME;
			for (let i = 0; i < players.length; i++) {
				players[i].points = 0;
			}
			io.sockets.emit('init_game', {
				players: players,
				boosts: boosts,
				serverDt: SERVER_UPDATE_DT,
			});
		}, players.length * 1000 + 3000);
  });

  socket.on('disconnect', function() {
    connectionsCount--;
    io.sockets.emit('player_disconnected', socket.player);
    delete sockets[socket.id];
    for (let i = 0; i < players.length; i++) {
      if (players[i].id === socket.id) {
        players.splice(i, 1);
        return;
      }
    }
    if (connectionsCount === 0) {
      players = [];
      sockets = {};
    }
  });
});

function createBoost() {
  const weightedRand = Math.pow(Math.random(), 2);
  const rarity = Math.floor(weightedRand * boostsLibrary.length);
  const rarityCount = boostsLibrary[rarity].length;
  const boostIndex = Math.floor(Math.random() * rarityCount);

  const add = rarity * 2 + 1;

  return {
    name: boostsLibrary[rarity][boostIndex],
    value: add,
    id: boostIdCounter++,
  };
}

setInterval(function() {
  if (state !== STATE_GAME) return;
  if (boosts.length < 3) {
    const boost = createBoost();
    boosts.push(boost);
    io.sockets.emit('boost_spawn', boost);
  }
  io.sockets.emit('game_update', players);
}, SERVER_UPDATE_DT);
