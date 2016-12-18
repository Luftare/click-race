var comms = {
  id: false,
  connected: false,
  myCar: false,
  clientUpdateDt: 500,
  connect: function () {
    var socket = io.connect(window.location.href);
    comms.socket = socket;

    socket.on("connect", function() {
      comms.id = socket.io.engine.id;
      comms.connected = true;
      console.log("online: "+comms.id);
    });

    socket.on("game_update",function (data) {
      gameStates.game.onServerUpdate(data);
    })

    socket.on("init_game",function (data) {
      game.state.start("game",true,false,data);
    });

    socket.on("player_disconnected",function (player) {
      gameStates.game.removePlayer(player);
    });

    socket.on("player_connected",function (player) {
      gameStates.game.onNewPlayer(player);
    });

    // socket.on("")
    // game.state.start("game",true,false,this.data);

  },

  emitClientUpdate: function (data) {
    comms.socket.emit("client_update",data);
  },

  login: function (data) {
    comms.socket.emit("login",data);
  }
};
