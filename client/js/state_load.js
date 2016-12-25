	gameStates.load = {

	init: function (data) {
		this.data = data;
	},
/*
rarity/type

rarity 0 1 2 3 4 5
		0  x x x x
		1      x x x
		2          x x
		3	           x
*/
	preload: function(){
		game.load.image("finishline","images/finishline.png");

		//greys
		game.load.image("boost00","images/boost00.png");
		game.load.image("boost10","images/boost10.png");
		game.load.image("boost20","images/boost20.png");
		game.load.image("boost30","images/boost30.png");
		//greens
		game.load.image("boost21","images/boost21.png");
		game.load.image("boost31","images/boost31.png");
		game.load.image("boost41","images/boost41.png");
		//blues
		game.load.image("boost42","images/boost42.png");
		game.load.image("boost52","images/boost52.png");
		//orange
		game.load.image("boost53","images/boost53.png");

		game.load.image("pedal","images/pedal.png");
		game.load.image("car0","images/car0.png");
		game.load.image("car1","images/car1.png");
		game.load.image("car2","images/car2.png");

		game.load.image("particle0","images/particle0.png");
		game.load.image("particle1","images/particle1.png");
		game.load.image("particle2","images/particle2.png");
		game.load.image("particle3","images/particle3.png");

		game.load.image("star","images/star.png");
		game.load.image("smoke","images/smoke.png");

		game.load.image("meter","images/meter.png");
		game.load.image("meter_pointer","images/meter_pointer.png");
	},

	create: function () {
			if(devmode){
				game.state.start("game",true,false,{
					players: [{
						id: 2,
						car: "car0",
						points: 0
					}],
					boosts: [
						{
							name: "boost00",
							value: 1,
							id: 6
						}
					]
				});
			} else {
				game.state.start("login");
			}

	}

};
