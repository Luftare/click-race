var gameStates = {};

gameStates.boot = {
	init: function (data) {
		this.data = data;
	},

	create: function(){
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.stage.backgroundColor = "#64a";
		comms.connect();
		game.state.start("load",true,false,this.data);
	}
}
