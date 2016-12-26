gameStates.game = {
	init: function (data) {
		this.data = data;
	},

	preload: function(){

		this.gameStartTime = Date.now();
		this.crossedFinishline = false;
		this.lastClientUpdateTime = Date.now();
		this.lastPointUpdate = Date.now();
		this.motorCooling = false;
		this.rpm = 0;
		this.maxRpm = 80;
		this.optimalRpm = 60;

		this.playersCount = 0;

		this.rpmAcceleration = 1;
		this.rpmDeceleration = -0.5;
		this.pedalDown = false;
		this.maxPointsPerSecond = 0.01;

		this.meterShakeAmount = 0;

		this.targetPoints = 2000;
		this.trackWidth = 5000;

		this.clickerY = game.camera.height-50;
		this.clickerHideY = game.camera.height + 150;
		this.boostY = this.clickerY - 100;
		this.boostHideY = game.camera.height + 100;
		this.counterTextY = 50;
		this.playersContainerY = 100;
		this.playerTrackWidth = game.camera.width/2;

		this.hideAnimationTime = 500;

		this.myPoints = 0;
		this.myIncome = 1;
		this.myCar = null;
		this.boostMaxCooldown = 10000;
		this.boosts = game.add.group();
		this.boosts.y = this.boostY;
		this.waitingBoostResponse = false;

		this.groundColor = 0x4cd27c;
		this.skyColor = 0xccffff;

		this.skyBox = game.add.graphics(0, 0);
		this.skyBox.beginFill(this.skyColor);
		this.skyBox.drawRect(0, 0, game.camera.width, 100);

		this.groundBox = game.add.graphics(0, 0);
		this.groundBox.beginFill(this.groundColor);
		this.groundBox.drawRect(0, 100, game.camera.width, 120);

		this.progressBar = game.add.graphics(-game.camera.width, 220);
		this.progressBar.beginFill(0xdddd00);
		this.progressBar.drawRect(-game.camera.width, 0, 2*game.camera.width, 20);

		this.hills_back = game.add.group();
		this.hills_mid = game.add.group();
		this.trees_back = game.add.group();
		this.road = game.add.group();

		this.finishlineSprite = game.add.sprite(100, 120,"finishline");
		this.finishlineSprite.anchor.setTo(1,0);

		this.startLine = game.add.graphics(100, 120);
		this.startLine.beginFill(0xdddd00);
		this.startLine.drawRect(0, 0, 10, 60);

		this.playersContainer = game.add.group();
		this.playersContainer.y = 120;
		this.playersContainer.x = game.camera.width/2;

		this.trees_front = game.add.group();

		this.smokeEmitter = game.add.emitter(100, 150, 200);
		this.smokeEmitter.makeParticles(["smoke"]);
		this.smokeEmitter.start(false, 2000, 100);
		this.smokeEmitter.setYSpeed(-5, -10);
		this.smokeEmitter.setXSpeed(-30,0);
		this.smokeEmitter.gravity = 0;
		this.smokeEmitter.minParticleScale = 0.3;
		this.smokeEmitter.maxParticleScale = 0.7;
		this.smokeEmitter.on = false;

		// this.hills_back.create(0,0,"hills_back");
		this.hills_back_width = game.cache.getImage("hills_back").width;
		var hills_back_count = 1 + game.camera.width / this.hills_back_width;
		var hill;
		for (var i = 0; i < hills_back_count; i++) {
			hill = this.hills_back.create(i*this.hills_back_width,0,"hills_back");
			hill.anchor.setTo(0,1);
		}

		this.hills_mid_width = game.cache.getImage("hills_mid").width;
		var hills_mid_count = 1 + game.camera.width / this.hills_mid_width;
		for (var i = 0; i < hills_mid_count; i++) {
			hill = this.hills_mid.create(i*this.hills_mid_width,0,"hills_mid");
			hill.anchor.setTo(0,1);
		}

		this.road_width = game.cache.getImage("road").width;
		var road_count = 1 + game.camera.width / this.road_width;
		for (var i = 0; i < road_count; i++) {
			hill = this.road.create(i*this.road_width,0,"road");
			hill.anchor.setTo(0,0);
		}

		var trees_count = Math.floor(game.camera.width/120);
		for (var i = 0; i < trees_count; i++) {
			hill = this.trees_front.create( (i/trees_count)*game.camera.width + Math.random()*100,200+Math.random()*20,"tree"+Math.round(Math.random()));
			hill.anchor.setTo(0.5,1);
		}

		var trees_count = Math.floor(game.camera.width/40);
		var treeDist;
		for (var i = 0; i < trees_count; i++) {
			treeDist = Math.random();
			hill = this.trees_back.create( (i/trees_count)*game.camera.width + Math.random()*20,105+(1-treeDist)*10,"tree"+Math.round(Math.random()));
			hill.anchor.setTo(0.5,1);
			hill.scale.setTo( (1-treeDist)*0.4 + 0.3);
		}



		this.hills_back.y = 100;
		this.hills_mid.y = 100;
		this.road.y = 120;


		this.particleEmitter = game.add.emitter(game.camera.width/2, game.camera.height/2, 20);
		this.particleEmitter.makeParticles(['particle0', 'particle1', 'particle2',"particle3"]);
		this.particleEmitter.minParticleScale = 0.5;
		this.particleEmitter.maxParticleScale = 1;
		this.particleEmitter.start(false, 4000, 300);
		this.particleEmitter.on = false;

		this.starEmitter = game.add.emitter(game.camera.width/2, game.camera.height/2, 200);
		this.starEmitter.makeParticles("star");
		this.starEmitter.minParticleScale = 0.3;
    this.starEmitter.maxParticleScale = 1;

		this.bigTextStyle = { font: "40px Arial", fill: "#fff", stroke: '#000000', strokeThickness: 6};
		this.mediumTextStyle = { font: "26px Arial", fill: "#fff", stroke: '#000000', strokeThickness: 4};

		this.boostMarginX = 100;

		this.cooldownBarWidth = 60;
		this.cooldownBarHeight = 10;

		this.pendingBoost = null;

		this.counterText = game.add.text(game.camera.width/2, this.counterTextY, this.myPoints, this.bigTextStyle);
		this.counterText.anchor.setTo(0.5,0.5);
		this.counterText.visible = false;

		this.clicker = game.add.sprite(game.camera.width/2, this.clickerY,"pedal");
		this.clicker.anchor.setTo(0.5,0.5);
		this.clicker.inputEnabled = true;
		this.clicker.events.onInputDown.add(function () {
			if(!this.motorCooling) this.pedalDown = true;
		},this);

		this.clicker.events.onInputUp.add(function () {
			this.pedalDown = false;
		},this);

		this.incomeText = game.add.text(0,-0, this.myIncome, this.mediumTextStyle);
		this.incomeText.anchor.setTo(0.5,0.5);
		this.clicker.addChild(this.incomeText)

		this.meter = game.add.sprite(game.camera.width/2, game.camera.height/2,"meter");
		this.meter.anchor.setTo(0.5,0.5);
		this.meter_pointer = game.add.sprite(0, 0,"meter_pointer");
		this.meter_pointer.anchor.setTo(0,0.5);
		this.meter.addChild(this.meter_pointer);

		this.onServerInitGame();
	},

	onServerInitGame: function () {
		var players = this.data.players;
		var player;
		for (var i = 0; i < players.length; i++) {
			player = this.addPlayer(players[i]);
			if(players[i].id === comms.id) this.myCar = player;
		}
		var boosts = this.data.boosts;
		for (var i = 0; i < boosts.length; i++) {
			this.addBoost(boosts[i]);
		}
	},

	onServerUpdate: function (players) {
		if(game.state.current !== "game") return;
		this.playersCount = players.length;
		var car;
		for (var i = 0; i < players.length; i++) {
			if(players[i].id !== comms.id){
				car = this.getPlayer(players[i].id);
				if(car){
					car.playerData.points = players[i].points;
				}
			}
		}

	},

	onNewPlayer: function (player) {
		if(game.state.current !== "game") return;
		this.addPlayer(player);
	},

	onBoostSpawn: function (boost) {
		if(game.state.current !== "game") return;
		this.addBoost(boost);
		this.positionBoosts();
	},

	addPlayer: function (data) {
		var car = this.playersContainer.create(0,0,data.car);
		car.anchor.setTo(1,1);
		car.x = this.playerTrackWidth*(0-0.5);
		car.playerData = data;
		var tag = game.add.text(15,0,data.name,this.mediumTextStyle);
		tag.anchor.setTo(0,0.8);
		car.addChild(tag)
		if(data.id === comms.id) this.myCar = car;
		return car;
	},

	removePlayer: function (player) {
		if(game.state.current !== "game") return;
		this.playersContainer.forEach(function (p) {
			if(p.playerData && player && (p.playerData.id === player.id) ){
				p.destroy();
			}
		})
	},

	getPlayer: function (id) {
		var result;
		this.playersContainer.forEach(function (p) {
			if(p.playerData.id === id){
				result = p;
				return;
			}
		},this);
		return result;
	},

	create: function () {

	},

	onClick: function () {
		if(!this.crossedFinishline && this.myCar){
			this.clicker.scale.setTo(0.95,0.95);
			game.add.tween(this.clicker.scale).to({x: 1, y:1},50,"Linear",true);
			this.myCar.playerData.points += this.myIncome;
			this.counterText.text = this.myCar.playerData.points;
			if(this.myCar.playerData.points >= this.targetPoints){
				this.onCrossFinishline();
			}
		}
	},

	onCrossFinishline: function () {
		this.crossedFinishline = true;
		this.myCar.crossedFinishline = true;
		var startX = this.myCar.x;
		game.add.tween(this.myCar).to({x: startX + 100},1000,Phaser.Easing.Quadratic.InOut,true);
		comms.requestVictory();
	},

	hideBoosts: function () {
		if(this._tweenBoostsDisplay && this._tweenBoostsDisplay.stop) this._tweenBoostsDisplay.stop();
		this._tweenBoostsDisplay = game.add.tween(this.boosts).to({x: game.camera.width},this.hideAnimationTime,Phaser.Easing.Quadratic.InOut,true);
	},

	showBoosts: function () {
		if(this._tweenBoostsDisplay && this._tweenBoostsDisplay.stop) this._tweenBoostsDisplay.stop();
		game.add.tween(this.boosts).to({x:0},this.hideAnimationTime,Phaser.Easing.Quadratic.InOut,true);
	},

	hideClicker: function () {
		if(this._tweenClickerDisplay && this._tweenClickerDisplay.stop) this._tweenClickerDisplay.stop();
		this._tweenClickerDisplay = game.add.tween(this.clicker).to({y: this.clickerHideY},this.hideAnimationTime,Phaser.Easing.Quadratic.InOut,true);
		game.add.tween(this.meter.scale).to({x:0,y:0},200,Phaser.Easing.Quadratic.InOut,true);
		// this.meter.visible = false;
		this.meter_pointer.visible = false;
	},

	showClicker: function () {
		if(this._tweenClickerDisplay && this._tweenClickerDisplay.stop) this._tweenClickerDisplay.stop();
		game.add.tween(this.clicker).to({y:this.clickerY},this.hideAnimationTime,Phaser.Easing.Quadratic.InOut,true);
		game.add.tween(this.meter.scale).to({x:1,y:1},200,Phaser.Easing.Quadratic.InOut,true);
		// this.meter.visible = true;
		this.meter_pointer.visible = true;
	},

	onBoostCooldownStart: function (boost) {
		this.hideBoosts();
		this.hideClicker();
		this.particleEmitter.on = true;
		this.pendingBoost = boost;
		boost.pendingSprite = game.add.sprite(game.camera.width/2,game.camera.height/2,boost.name);
		boost.pendingSprite.anchor.setTo(0.5,0.5);
		this._pendingCooldownBar = new Phaser.Rectangle(0, -50, this.cooldownBarWidth, this.cooldownBarHeight);
	},

	onBoostCooldownFinish: function (boost) {
		this.showBoosts();
		this.showClicker();
		this.particleEmitter.on = false;
		boost.pendingSprite.destroy();
		this.pendingBoost = null;
		this._pendingCooldownBar = null;
		this.applyBoost(boost);
	},

	getTickPoints: function (now) {
		return this.myIncome*(now-this.lastPointUpdate)*(this.rpm/this.maxRpm)*this.maxPointsPerSecond;
	},

	update: function () {

		var now = Date.now();
		var points;

		this.meter.x = game.camera.width/2 + Math.sin(now/10)*this.meterShakeAmount;
		this.meterShakeAmount = Math.max(0,this.meterShakeAmount-0.1);

		if(this.pedalDown){
			this.rpm += this.rpmAcceleration;
		} else {
			this.rpm += this.rpmDeceleration;
		}

		if(this.rpm <= 0) this.rpm = 0;
		if(this.rpm >= this.maxRpm && !this.motorCooling){
			this.rpm = this.maxRpm;
			this.meterShakeAmount = 15;
			this.motorCooling = true;
			this.pedalDown = false;
			this.particleEmitter.on = true;
		}
		if(this.motorCooling && this.rpm <= 0){
			this.motorCooling = false;
			this.meterShakeAmount = 0;
			this.particleEmitter.on = false;
		}

		points = this.getTickPoints(now);

		this.smokeEmitter.on = this.rpm > this.optimalRpm;
		this.meter_pointer.rotation = Math.PI*(5/6)+(this.rpm/this.maxRpm)*(8/6)*Math.PI;

		this.road.x -= (points/this.targetPoints)*this.trackWidth;
		this.hills_mid.x -= (points/this.targetPoints)*this.trackWidth*0.2;
		this.hills_back.x -= (points/this.targetPoints)*this.trackWidth*0.1;

		this.finishlineSprite.x = this.myCar.worldPosition.x + this.trackWidth - (this.myCar.playerData.points/this.targetPoints)*this.trackWidth;
		this.startLine.x = this.myCar.worldPosition.x - (this.myCar.playerData.points/this.targetPoints)*this.trackWidth;

		if(-this.road.x > this.road_width) this.road.x = 0;
		if(-this.hills_mid.x > this.hills_mid_width) this.hills_mid.x = 0;
		if(-this.hills_back.x > this.hills_back_width) this.hills_back.x = 0;

		this.trees_back.forEach(function (t) {
			t.x -= (points/this.targetPoints)*this.trackWidth*0.8;
			if(t.x + 25 <= 0) t.x = game.camera.width + 25;
		},this);

		this.trees_front.forEach(function (t) {
			t.x -= (points/this.targetPoints)*this.trackWidth*1.4;
			if(t.x + 30 <= 0) t.x = game.camera.width + 30;
		},this);

		if(!this.crossedFinishline && this.myCar){
			this.myCar.playerData.points += points;
			this.counterText.text = this.myCar.playerData.points;
			if(this.myCar.playerData.points >= this.targetPoints){
				this.onCrossFinishline();
			}
		}

		this.lastPointUpdate = now;

		this.progressBar.x = (this.myCar.playerData.points/this.targetPoints)*game.camera.width - game.camera.width;

		if(!devmode){
			this.smokeEmitter.x = this.myCar.worldPosition.x-this.myCar.width;
			this.smokeEmitter.y = this.myCar.worldPosition.y+this.myCar.height/2;
		}



		if(now - this.lastClientUpdateTime >= comms.clientUpdateDt){
			this.lastClientUpdateTime = now;
			if(!devmode) comms.emitClientUpdate(this.myCar.playerData);
		}

		if(this.pendingBoost){
			if(now - this.pendingBoost.spawnThen > this.boostMaxCooldown){
				this.onBoostCooldownFinish(this.pendingBoost);
			}
		}

		var index = 0;
		var roadMargin = 15;
		var roadHeight = 60;
		var containerHeight = roadHeight - roadMargin*2;
		var playerMargin = containerHeight/this.playersCount;

		this.playersContainer.forEach(function (p) {
			index++;
			p.x = ((p.playerData.points - this.myCar.playerData.points)/this.targetPoints)*this.trackWidth;
			p.y = roadMargin + index*playerMargin;
		},this);
	},

	render: function () {
		var now = Date.now();
		this.boosts.forEach(function (b) {
			b.cooldownBar.width = Math.max(0, this.cooldownBarWidth*(1 - (now - b.spawnThen)/this.boostMaxCooldown) );
			b.cooldownBar.x = b.worldPosition.x - this.cooldownBarWidth/2;
			b.cooldownBar.y = b.worldPosition.y - 50;
			game.debug.geom(b.cooldownBar,"#ff4444");
		},this);

		if(this._pendingCooldownBar && this.pendingBoost){
			var w = Math.max(0, this.cooldownBarWidth*(1 - (now - this.pendingBoost.spawnThen)/this.boostMaxCooldown) );
			this._pendingCooldownBar.x = this.pendingBoost.pendingSprite.worldPosition.x - this.cooldownBarWidth/2;
			this._pendingCooldownBar.y = this.pendingBoost.pendingSprite.worldPosition.y - 50;
			this._pendingCooldownBar.width = w;
			game.debug.geom(this._pendingCooldownBar,"#ff4444");
		}
	},

	positionBoosts: function () {
		var index = 0;
		var time = 320;
		var tween;
		var x,y;
		this.boosts.forEach(function (b) {
			x = game.camera.width/2 + this.boostMarginX*(index-1);
			tween = game.add.tween(b).to({x:x, y:0},time,Phaser.Easing.Quadratic.InOut,true);
			index++;
		},this);
	},

	addBoost: function (boost) {
		var b = game.add.sprite(game.camera.width/1,0,boost.name);
		b.id = boost.id;
		b.spawnThen = boost.spawnThen = Date.now();
		b.anchor.setTo(0.5,0.5);
		b.inputEnabled = true;
		b.events.onInputDown.add(function () {
			this.onBoostClick(b,boost);
		},this);
		b.cooldownBar = new Phaser.Rectangle(0, -50, this.cooldownBarWidth, this.cooldownBarHeight);
		var txt = "+" + boost.value;
		b.pricetag = game.add.text(0, 50, txt, this.mediumTextStyle);
		b.pricetag.anchor.setTo(0.5,0.5);
		b.addChild(b.pricetag);
		this.boosts.add(b);
		this.positionBoosts();
	},

	onBoostClick: function (sprite,boost) {
		if(!this.waitingBoostResponse && !this.pendingBoost){
			this.waitingBoostResponse = true;//disable purchase of further boosts if there's no reply yet
			this.boosts.remove(sprite,false,true);//remove boost, someone will get it anyway
			comms.requestBoost(boost,
				(function (isSuccess) {
					if(isSuccess){
						this.waitingBoostResponse = false;
						this.counterText.text = this.myPoints;
						if(Date.now() - sprite.spawnThen < this.boostMaxCooldown){//cooldown remaining
							this.onBoostCooldownStart(boost);
						} else {
							this.showBoosts();
							this.applyBoost(boost);
						}
					} else {
						this.waitingBoostResponse = false;
						this.showBoosts();
					}
			}).bind(this));
		}
	},

	removeBoost: function (boost) {
		if(game.state.current !== "game") return;
		if(!boost) return;
		this.boosts.forEach(function (b) {
			if(b.id === boost.id) b.destroy();
		},this);
	},

	applyBoost: function (boost) {
		var icon = game.add.sprite(game.camera.width/2,game.camera.height/2,boost.name);
		icon.anchor.setTo(0.5,0.5);
		var tween = game.add.tween(icon.scale).to({x:1.3, y:1.3},300,Phaser.Easing.Quadratic.Out,true);
		tween.onComplete.add(function () {
			this.starEmitter.start(true, 3000, null, 10);
			var shrink = game.add.tween(icon.scale).to({x:0, y:0},300,Phaser.Easing.Quadratic.In,true);
			shrink.onComplete.add(function () {
				icon.destroy();
			},this);
		}, this);

		this.myIncome += boost.value;
		this.myIncome = Math.floor(this.myIncome);
		this.incomeText.text = this.myIncome;
	}
}
