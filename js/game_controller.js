var game = new Phaser.Game(window.innerWidth, window.innerHeight , Phaser.AUTO, "game_container");
game.state.add("boot",gameStates.boot);
game.state.add("load",gameStates.load);
game.state.add("game",gameStates.game);
game.state.start("boot",true,false,"some data...");
