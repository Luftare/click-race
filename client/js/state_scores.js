gameStates.scores = {
	init: function (data) {
		this.data = data;
	},

  preload: function () {
		var self = this;

		this.listY = 150;

		this.mediumTextStyle = { font: "26px Arial", fill: "#fff", stroke: '#000000', strokeThickness: 4};

		this.emitterRect = new Phaser.Rectangle(0,0,game.camera.width/1,10);
		this.particleEmitter = game.add.emitter(game.camera.width/2, -50, 200);
		this.particleEmitter.makeParticles(["star"]);
		this.particleEmitter.start(false, 20000, 200);
		this.particleEmitter.area = this.emitterRect;
		this.particleEmitter.setYSpeed(50, 100);
		this.particleEmitter.setXSpeed(-10,10);
		this.particleEmitter.gravity = 0;
		this.particleEmitter.minParticleScale = 0.5;
		this.particleEmitter.maxParticleScale = 1;
		this.particleEmitter.on = true;

		this.header = game.add.text(game.camera.width/2, 80, "Ranking", { font: "52px Arial Black", fill: "#111" });
		this.header.anchor.setTo(0.5);
		this.header.stroke = "#baf";
		this.header.strokeThickness = 16;
		this.header.setShadow(2, 2, "#333333", 2, true, false);

		var cars = [];
		
		cars.push({
			sprite: "car0",
			name: "Jeppe",
			points: 0,
			id: Date.now()
		})

		cars.push({
			sprite: "car1",
			name: "Jeppe",
			points: 0,
			id: Date.now()
		})
		cars.push({
			sprite: "car2",
			name: "Jeppe",
			points: 0,
			id: Date.now()
		})
		cars.push({
			sprite: "car1",
			name: "Jeppe",
			points: 0,
			id: Date.now()
		})

		var self = this;
		for (var i = 0; i < cars.length; i++) {
			(function (car,i) {
				setTimeout(function () {
					self.addRow(car,i);
				},1000*i);
			})(cars[i],i)
		}
  },

	addRow: function (car,index) {
		var marginY = 50;
		var name = game.add.text(game.camera.width/2-120,this.listY + index*marginY-200, (index + 1) + ". " + car.name,this.mediumTextStyle);
		name.anchor.setTo(0,0.5)
		var sprite = game.add.sprite(game.camera.width/2 + 120, this.listY + index*marginY-200,car.sprite);
		sprite.anchor.setTo(1,0.5);
		game.add.tween(sprite).to( { y:this.listY + index*marginY }, 1000, Phaser.Easing.Bounce.Out, true);
		game.add.tween(name).to( { y:this.listY + index*marginY }, 1000, Phaser.Easing.Bounce.Out, true)
	},

  update: function () {

  },

	render: function () {

	},

	create: function(){

	},

	setBouncing: function (u,amount) {
		if(u._bounce) return;
		u.scale.setTo(1);
		u._bounce = game.add.tween(u.scale).to( { y: amount || 1.2,x: amount || 1.2 }, 300, Phaser.Easing.Quadratic.InOut, true,0,-1);
		u._bounce.yoyo(true);
	},

	stopBouncing: function (u) {
		if(!u._bounce) return;
		u._bounce.stop();
		u.scale.setTo(1);
		delete u._bounce;
	}
}
