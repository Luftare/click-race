gameStates.login = {
	init: function (data) {
		this.data = data;
	},

  preload: function () {
		this.emitterRect = new Phaser.Rectangle(0,0,game.camera.width/1,10);
		this.particleEmitter = game.add.emitter(game.camera.width/2, -50, 200);
		this.particleEmitter.makeParticles(['particle0', 'particle1', 'particle2',"particle3"]);
		this.particleEmitter.start(false, 20000, 200);
		this.particleEmitter.area = this.emitterRect;
		this.particleEmitter.setYSpeed(50, 100);
		this.particleEmitter.setXSpeed(-10,10);
		this.particleEmitter.gravity = 0;
		this.particleEmitter.minParticleScale = 0.5;
		this.particleEmitter.maxParticleScale = 1;
		this.particleEmitter.on = true;

		this.carY = game.camera.height/2-50;
		this.carMarginX = 100;

		this.car0 = game.add.sprite(game.camera.width/2-this.carMarginX,this.carY,"car0");
		this.car0.anchor.setTo(0.5,1);

		this.car1 = game.add.sprite(game.camera.width/2,this.carY,"car1");
		this.car1.anchor.setTo(0.5,1);

		this.car2 = game.add.sprite(game.camera.width/2+this.carMarginX,this.carY,"car2");
		this.car2.anchor.setTo(0.5,1);

		this.pedal = game.add.sprite(game.camera.width/2,game.camera.height/2+50,"pedal");
		this.pedal.anchor.setTo(0.5,0);
  },

	liftCar: function (name) {
		//move all cars to line and tween this car up
	};

  update: function () {

  },

	render: function () {

	},

	create: function(){

	}
}
