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
