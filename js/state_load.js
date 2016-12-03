gameStates.load = {

	init: function (data) {
		this.data = data;
	},

	preload: function(){
		game.load.image("dragon","images/dragon.png");
	},

	create: function () {
		game.state.start("game",true,false,this.data);
	}

};
