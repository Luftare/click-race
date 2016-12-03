gameStates.game = {
	init: function (data) {
		this.data = data;
	},

	preload: function(){
		this.myPoints = 0;
		this.myIncome = 1;
		this.boostMaxCooldown = 5000;
		this.boosts = game.add.group();

		this.bigTextStyle = { font: "60px Arial", fill: "#fff", stroke: '#000000', strokeThickness: 0};
		this.mediumTextStyle = { font: "30px Arial", fill: "#fff", stroke: '#000000', strokeThickness: 0};

		this.boostMarginX = 100;
		this.boostY = 100;
		this.cooldownBarWidth = 50;
		this.cooldownBarHeight = 10;

		this.pendingBoost = null;

		this.counterText = game.add.text(game.camera.width/2, game.camera.height/2, this.myPoints, this.bigTextStyle);
		this.counterText.anchor.setTo(0.5,0.5);
		this.counterText.fixedToCamera = true;

		this.clicker = game.add.sprite(game.camera.width/2, game.camera.height-100,"dragon");
		this.clicker.anchor.setTo(0.5,0.5);
		this.clicker.fixedToCamera = true;
		this.clicker.inputEnabled = true;
		this.clicker.events.onInputDown.add(function () {
			this.onClick();
		},this);

		this.incomeText = game.add.text(0,-50, this.myIncome, this.mediumTextStyle);
		this.incomeText.anchor.setTo(0.5,0.5);
		this.clicker.addChild(this.incomeText)
	},

	create: function () {
		for (var i = 0; i < 3; i++) {
			this.addBoost(this.createBoost());
		}
		this.positionBoosts();
		this.updateBoostTint();
	},

	createBoost: function () {
		var val = Math.floor(Math.random()*100)+1;
		return {
			name: "dragon",
			cost: 1,
			add: 0,
			mult: 2
		}
	},

	onClick: function () {
		this.myPoints += this.myIncome;
		this.counterText.text = this.myPoints;
		this.updateBoostTint();
	},

	onBoostCooldownStart: function (boost) {
		//TODO: disable actions while waiting
		this.pendingBoost = boost;
		boost.pendingSprite = game.add.sprite(50,50,boost.name);
	},

	onBoostCooldownFinish: function (boost) {
		//TODO: return actions back
		this.applyBoost(boost);
		boost.pendingSprite.destroy();
		this.pendingBoost = null;
	},

	update: function () {
		if(this.pendingBoost){
			if(Date.now() - this.pendingBoost.spawnThen > this.boostMaxCooldown){
				this.onBoostCooldownFinish(this.pendingBoost);
			}
		}
	},

	updateBoostTint: function () {
		this.boosts.forEach(function (b) {
			if(b.cost > this.myPoints){
				b.tint = "0xff9999";
			} else {
				b.tint = "0xffffff";
			}
		},this);
	},

	positionBoosts: function () {
		var index = 0;
		var time = 120;
		var tween;
		var x,y;
		this.boosts.forEach(function (b) {
			x = game.camera.width/2 + this.boostMarginX*(index-1);
			y = this.boostY;
			tween = game.add.tween(b).to({x:x, y:y},time,Phaser.Easing.Quadratic.InOut,true);
			index++;
		},this);
	},

	render: function () {
		var now = Date.now();
		this.boosts.forEach(function (b) {
			b.cooldownBar.width = Math.max(0, this.cooldownBarWidth*(1 - (now - b.spawnThen)/this.boostMaxCooldown) );
			b.cooldownBar.x = b.x - this.cooldownBarWidth/2;
			b.cooldownBar.y = b.y - 40;
			game.debug.geom(b.cooldownBar,"#44ff44");
		},this);
	},

	addBoost: function (boost) {
		var b = game.add.sprite(game.camera.width/2,0,boost.name);
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

		b.pricetag = game.add.text(0, 50, boost.cost, this.mediumTextStyle);
		b.pricetag.anchor.setTo(0.5,0.5);
		b.addChild(b.pricetag);
		this.boosts.add(b);
		this.positionBoosts();
		this.updateBoostTint();

	},

	applyBoost: function (boost) {
		this.myIncome += boost.add;
		this.myIncome *= boost.mult;
		this.myIncome = Math.floor(this.myIncome);
		this.incomeText.text = this.myIncome;
	}
};
