gameStates.login = {
	init: function (data) {
		this.data = data;
	},

  preload: function () {
		var self = this;
		this.inputField = document.getElementById("input_name");
		this.inputField.hidden = true;
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

		this.carY = game.camera.height/2-0;
		this.carMarginX = 100;

		this.car0 = game.add.sprite(game.camera.width/2-this.carMarginX,this.carY,"car0");
		this.car0.anchor.setTo(0.5,1);

		this.car1 = game.add.sprite(game.camera.width/2,this.carY,"car1");
		this.car1.anchor.setTo(0.5,1);

		this.car2 = game.add.sprite(game.camera.width/2+this.carMarginX,this.carY,"car2");
		this.car2.anchor.setTo(0.5,1);

		this.car0.inputEnabled = true;
		this.car1.inputEnabled = true;
		this.car2.inputEnabled = true;

		this.car0.events.onInputDown.add(function () {
			this.selectedCar = this.car0;
			this.car1.kill();
			this.car2.kill();
			game.add.tween(this.car0).to( { x: game.camera.width + 100 }, 1000, Phaser.Easing.Back.In, true)
				.onComplete.add(function () {
					this.askName();
				},this);
		},this);

		this.car1.events.onInputDown.add(function () {
			this.selectedCar = this.car1;
			this.car0.kill();
			this.car2.kill();
			game.add.tween(this.car1).to( { x: game.camera.width + 100 }, 1000, Phaser.Easing.Back.In, true)
				.onComplete.add(function () {
					this.askName();
				},this);
		},this);

		this.car2.events.onInputDown.add(function () {
			this.selectedCar = this.car2;
			this.car0.kill();
			this.car1.kill();
			game.add.tween(this.car2).to( { x: game.camera.width + 100 }, 1000, Phaser.Easing.Back.In, true)
				.onComplete.add(function () {
					this.askName();
				},this);
		},this);

		this.pedal = game.add.sprite(game.camera.width/2,game.camera.height/2+50,"pedal");
		this.pedal.anchor.setTo(0.5,0);
		this.pedal.inputEnabled = false;
		this.pedal.events.onInputDown.add(function () {
			this.playerName = this.inputField.value;
			this.data = {
				name: this.playerName,
				car: this.selectedCar.key
			};
			this.inputField.hidden = true;
			this.connect();
		},this);

		this.header = game.add.text(game.camera.width/2,game.camera.height/2 - 100, "Select a car", { font: "52px Arial Black", fill: "#111" });
		this.header.anchor.setTo(0.5);
		this.header.stroke = "#baf";
		this.header.strokeThickness = 16;
		this.header.setShadow(2, 2, "#333333", 2, true, false);

		this.pedalText = game.add.text(0,this.pedal.height/2, "GO!",{ font: "26px Arial", fill: "#fff", stroke: '#000000', strokeThickness: 4});
		this.pedalText.anchor.setTo(0.5,0.5);
		this.pedal.addChild(this.pedalText);
		self.pedal.visible = false;

		this.inputField.oninput = function () {
			if(this.value){
				self.pedal.alpha = 1;
				self.pedal.inputEnabled = true;
			}
		}
  },

	askName: function () {
		this.header.text = "Pick a name"
		this.inputField.hidden = false;
		this.pedal.visible = true;
		this.pedal.alpha = 0.5;
	},

  update: function () {

  },

	render: function () {

	},

	create: function(){

	},

	connect: function () {
		game.state.start("game",true,false,this.data);
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
