gameStates.game = {
	init: function (data) {
		this.data = data;
	},

	preload: function(){

		this.gameStartTime = Date.now();
		this.crossedFinishline = false;

		this.boostsLibrary = [
			["boost00","boost10","boost20","boost30"],
			["boost21","boost31","boost41"],
			["boost42","boost52"],
			["boost53"]
		];

		this.targetPoints = 1000;

		this.clickerY = game.camera.height-80;
		this.clickerHideY = game.camera.height + 150;
		this.boostY = this.clickerY - 120;
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
		this.particleEmitter.start(false, 4000, 300);
		this.particleEmitter.on = false;

		this.starEmitter = game.add.emitter(game.camera.width/2, game.camera.height/2, 200);
		this.starEmitter.makeParticles("star");
		this.starEmitter.minParticleScale = 0.1;
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

	},

	create: function () {
		for (var i = 0; i < 3; i++) {
			this.addBoost(this.createBoost());
		}
		this.positionBoosts();

	 	this.myCar = this.playersContainer.create(0,0,"car1");
		this.myCar.anchor.setTo(1,0.5);
		this.myCar.x = this.playerTrackWidth*(0-0.5);
	},

	createBoost: function () {
		this.boostIdCounter = 1;//COMES FROM SERVER
		var weightedRand = Math.pow(Math.random(),6);

		var rarity = Math.floor(weightedRand*this.boostsLibrary.length);
		var rarityCount = this.boostsLibrary[rarity].length;
		var boostIndex = Math.floor(Math.random()*rarityCount);

		var add = rarity*2 + 1;

		return {
			name: this.boostsLibrary[rarity][boostIndex],
			value: add,
			id: this.boostIdCounter++
		};
	},

	onClick: function () {
		if(!this.crossedFinishline){
			this.myPoints += this.myIncome;
			this.counterText.text = this.myPoints;
			if(this.myPoints >= this.targetPoints){
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
		if(this.pendingBoost){
			if(Date.now() - this.pendingBoost.spawnThen > this.boostMaxCooldown){
				this.onBoostCooldownFinish(this.pendingBoost);
			}
		}
		this.playersContainer.forEach(function (p) {
				if(!p.crossedFinishline){
					p.x = this.playerTrackWidth*( (this.myPoints/this.targetPoints) - 0.5);
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
			this.waitingBoostResponse = true;
			this.boosts.remove(sprite,false,true);//remove boost, someone will get it anyway
			this.requestBoost(boost,
				(function () {//success
					this.waitingBoostResponse = false;
					this.counterText.text = this.myPoints;
					this.addBoost(this.createBoost());
					if(Date.now() - sprite.spawnThen < this.boostMaxCooldown){//cooldown remaining
						this.onBoostCooldownStart(boost);
					} else {
						this.showBoosts();
						this.applyBoost(boost);
					}
			}).bind(this),(function () {//fail
				this.waitingBoostResponse = false;
				this.addBoost(this.createBoost());
				this.showBoosts();
			}).bind(this));
		}
	},

	requestBoost: function (boost,onsuccess,onfail) {
		//send request to server
		var latency = Math.random()*0+120;
		// latency = 0;
		var fn = function fn() {
			if(Math.random()>0.1){
				onsuccess();
			} else {
				onfail();
			}
		};

		setTimeout(fn,latency);
	},

	applyBoost: function (boost) {
		//TODO: do eye candy
		var icon = game.add.sprite(game.camera.width/2,game.camera.height/2,boost.name);
		icon.anchor.setTo(0.5,0.5);
		var tween = game.add.tween(icon.scale).to({x:1.2, y:1.2},700,Phaser.Easing.Back.InOut,true);
		tween.onComplete.add(function () {
			icon.destroy();
		}, this);
		this.starEmitter.start(true, 3000, null, 10);
		this.myIncome += boost.value;
		this.myIncome = Math.floor(this.myIncome);
		this.incomeText.text = this.myIncome;
	}
}
