var comms = {
  id: false,
  connected: false,
  myCar: false,
  loggedIn: false,
  clientUpdateDt: 200,
  connect: function () {
    var socket = io.connect(window.location.href);
    comms.socket = socket;

    socket.on("connect", function() {
      comms.id = socket.io.engine.id;
      comms.connected = true;
    });

    socket.on("game_update",function (data) {
      gameStates.game.onServerUpdate(data);
    });

    socket.on("init_game",function (data) {
      if(!comms.loggedIn) return;
      game.state.start("game",true,false,data);
    });

    socket.on("boost_spawn",function (boost) {
      gameStates.game.onBoostSpawn(boost);
    });

    socket.on("remove_boost",function (boost) {
      gameStates.game.removeBoost(boost);
    });

    socket.on("player_disconnected",function (player) {
      gameStates.game.removePlayer(player);
    });

    socket.on("player_connected",function (player) {
      gameStates.game.onNewPlayer(player);
    });

    socket.on("to_scores",function (players) {
      game.state.start("scores",true,false,players);
    });

  },

  requestVictory: function (cb) {
    comms.socket.emit("request_victory",cb);
  },

  emitClientUpdate: function (data) {
    comms.socket.emit("client_update",data);
  },

  requestBoost: function (boost,cb){
    comms.socket.emit("request_boost",boost,cb);
  },

  login: function (data) {
    comms.socket.emit("login",data,function () {
      comms.loggedIn = true;
    });
  }
};
