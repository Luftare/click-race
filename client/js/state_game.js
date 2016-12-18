gameStates.game = {
	init: function (data) {
		this.data = data;
	},

	preload: function(){
		this.gameStartTime = Date.now();
		this.crossedFinishline = false;
		this.lastClientUpdateTime = Date.now();

		this.targetPoints = 1000;

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
		this.boostMaxCooldown = 5000;
		this.boosts = game.add.group();
		this.boosts.y = this.boostY;
		this.waitingBoostResponse = false;

		this.finishlineSprite = game.add.sprite(game.camera.width/2+this.playerTrackWidth/2, this.playersContainerY,"finishline");

		this.playersContainer = game.add.group();
		this.playersContainer.y = this.playersContainerY;
		this.playersContainer.x = game.camera.width/2;

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
			this.onClick();
		},this);

		this.incomeText = game.add.text(0,-0, this.myIncome, this.mediumTextStyle);
		this.incomeText.anchor.setTo(0.5,0.5);
		this.clicker.addChild(this.incomeText)

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

	createLocalPlayer: function () {
		var car = {
			car: this.data.car,
			name: this.data.name,
			points: 0,
			id: Date.now()
		};
		this.myCar = this.addPlayer(car);
	},

	addPlayer: function (data) {
		var car = this.playersContainer.create(0,0,data.car);
		car.anchor.setTo(1,0.5);
		car.x = this.playerTrackWidth*(0-0.5);
		car.playerData = data;
		var tag = game.add.text(15,0,data.name,this.mediumTextStyle);
		tag.anchor.setTo(0,0.5);
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
	},

	showClicker: function () {
		if(this._tweenClickerDisplay && this._tweenClickerDisplay.stop) this._tweenClickerDisplay.stop();
		game.add.tween(this.clicker).to({y:this.clickerY},this.hideAnimationTime,Phaser.Easing.Quadratic.InOut,true);
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

	update: function () {
		var now = Date.now();
		if(now - this.lastClientUpdateTime >= comms.clientUpdateDt){
			this.lastClientUpdateTime = now;
			comms.emitClientUpdate(this.myCar.playerData);
		}

		if(this.pendingBoost){
			if(Date.now() - this.pendingBoost.spawnThen > this.boostMaxCooldown){
				this.onBoostCooldownFinish(this.pendingBoost);
			}
		}
		var index = 0;
		this.playersContainer.forEach(function (p) {
			p.y = index*50;
			index++;
			if(!p.crossedFinishline){
				p.x = this.playerTrackWidth*( (p.playerData.points/this.targetPoints) - 0.5);
			}
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
