gameStates.wait = {
	init: function (data) {
		this.data = data;
	},

  preload: function () {
    this.cars = [];
    var carCount = 15;
    var car;
    for (var i = 0; i < carCount; i++) {
      car = game.add.sprite(Math.random()*game.camera.width, game.camera.height*(i/carCount),"car"+(i%3));
      game.physics.enable(car, Phaser.Physics.ARCADE);
      car.body.velocity.x = 200*Math.random()+50;
      this.cars.push(car);
    }

		this.header = game.add.text(game.camera.width/2, 80, "Waiting...", { font: "52px Arial Black", fill: "#111" });
		this.header.anchor.setTo(0.5);
		this.header.stroke = "#baf";
		this.header.strokeThickness = 16;
		this.header.setShadow(2, 2, "#333333", 2, true, false);
  },

  update: function () {
    for (var i = 0; i < this.cars.length; i++) {
      if(this.cars[i].x > game.camera.width){
        this.cars[i].x = -200;
      }
    }
  },

	create: function(){

	}
}
