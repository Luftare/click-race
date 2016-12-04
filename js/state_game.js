gameStates.game = {
	init: function (data) {
		this.data = data;
	},

	preload: function(){

		this.gameStartTime = Date.now();
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

		this.myPoints = 0;
		this.myIncome = 1;
		this.boostMaxCooldown = 100;
		this.boosts = game.add.group();
		this.boosts.y = this.boostY;

		this.finishlineSprite = game.add.sprite(game.camera.width/2+this.playerTrackWidth/2, this.playersContainerY,"finishline");

		this.playersContainer = game.add.group();
		this.playersContainer.y = this.playersContainerY;
		this.playersContainer.x = game.camera.width/2;

		this.bigTextStyle = { font: "40px Arial", fill: "#fff", stroke: '#000000', strokeThickness: 6};
		this.mediumTextStyle = { font: "26px Arial", fill: "#fff", stroke: '#000000', strokeThickness: 4};

		this.boostMarginX = 100;

		this.cooldownBarWidth = 60;
		this.cooldownBarHeight = 10;

		this.pendingBoost = null;

		this.counterText = game.add.text(game.camera.width/2, this.counterTextY, this.myPoints, this.bigTextStyle);
		this.counterText.anchor.setTo(0.5,0.5);
		this.counterText.fixedToCamera = true;

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
		this.updateBoostTint();

		var player = this.playersContainer.create(0,0,"car2");
		player.anchor.setTo(1,0.5);
		player.x = this.playerTrackWidth*(0-0.5);
	},

	createBoost: function () {
		var weightedRand = Math.pow(Math.random(),6);
		var variance = 0.2;
		var varianceMultiplier = 1 - variance + variance*2*Math.random();

		var rarity = Math.floor(weightedRand*this.boostsLibrary.length);
		var rarityCount = this.boostsLibrary[rarity].length;
		var boostIndex = Math.floor(Math.random()*rarityCount);

		var dt = Date.now() - this.gameStartTime;
		var add = null;
		var mult = null;

		add = rarity + Math.ceil(varianceMultiplier*dt*(Math.pow(rarity+1,1))*0.0001);

		return {
			name: this.boostsLibrary[rarity][boostIndex],
			rarity: rarity,
			cost: 0,
			add: add,
			mult: mult
		};
	},

	onClick: function () {
		this.myPoints += this.myIncome;
		this.counterText.text = this.myPoints;
		this.updateBoostTint();
	},

	onBoostCooldownStart: function (boost) {
		if(this._tweenBoostsDisplay && this._tweenBoostsDisplay.stop) this._tweenBoostsDisplay.stop();
		if(this._tweenClickerDisplay && this._tweenClickerDisplay.stop) this._tweenClickerDisplay.stop();
		this.counterText.visible = false;
		this._tweenBoostsDisplay = game.add.tween(this.boosts).to({y: this.boostHideY},200,Phaser.Easing.Quadratic.InOut,true);
		this._tweenClickerDisplay = game.add.tween(this.clicker).to({y: this.clickerHideY},200,Phaser.Easing.Quadratic.InOut,true);
		this.pendingBoost = boost;
		boost.pendingSprite = game.add.sprite(game.camera.width/2,game.camera.height/2,boost.name);
		boost.pendingSprite.anchor.setTo(0.5,0.5);
		this._pendingCooldownBar = new Phaser.Rectangle(0, -50, this.cooldownBarWidth, this.cooldownBarHeight);
	},

	onBoostCooldownFinish: function (boost) {
		if(this._tweenBoostsDisplay && this._tweenBoostsDisplay.stop) this._tweenBoostsDisplay.stop();
		if(this._tweenClickerDisplay && this._tweenClickerDisplay.stop) this._tweenClickerDisplay.stop();
		this.counterText.visible = true;
		game.add.tween(this.boosts).to({y:this.boostY},200,Phaser.Easing.Quadratic.InOut,true);
		game.add.tween(this.clicker).to({y:this.clickerY},200,Phaser.Easing.Quadratic.InOut,true);
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
				p.x = this.playerTrackWidth*( (this.myPoints/this.targetPoints) - 0.5);
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

	updateBoostTint: function () {
		this.boosts.forEach(function (b) {
			if(b.cost > this.myPoints){
				b.alpha = 0.5;
			} else {
				b.alpha = 1;
				}
		},this);
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
		b.cost = boost.cost;
		b.spawnThen = boost.spawnThen = Date.now();
		b.anchor.setTo(0.5,0.5);
		b.inputEnabled = true;
		b.events.onInputDown.add(function (e) {
			if(this.myPoints < boost.cost) return;//not enough points
			this.myPoints -= boost.cost;
			this.counterText.text = this.myPoints;
			this.boosts.remove(e,false,true);
			this.addBoost(this.createBoost());
			if(Date.now() - b.spawnThen < this.boostMaxCooldown){//cooldown remaining
				this.onBoostCooldownStart(boost);
			} else {
				this.applyBoost(boost);
			}
		},this);

		b.cooldownBar = new Phaser.Rectangle(0, -50, this.cooldownBarWidth, this.cooldownBarHeight);

		var txt = boost.mult? "x" + boost.mult : "+" + boost.add;

		b.pricetag = game.add.text(0, 50, txt, this.mediumTextStyle);
		b.pricetag.anchor.setTo(0.5,0.5);
		b.addChild(b.pricetag);
		this.boosts.add(b);
		this.positionBoosts();
		this.updateBoostTint();

	},

	applyBoost: function (boost) {
		//TODO: do eye candy
		if(boost.add) this.myIncome += boost.add;
	  if(boost.mult) this.myIncome *= boost.mult;
		this.myIncome = Math.floor(this.myIncome);
		this.incomeText.text = this.myIncome;
	}
}
