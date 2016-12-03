gameStates.game = {

	init: function (data) {
		this.data = data;
	},

	preload: function(){
		this.myPoints = 0;
		this.myIncome = 1;
		this.boosts = game.add.group();

		this.bigTextStyle = { font: "60px Arial", fill: "#fff", stroke: '#000000', strokeThickness: 0};
		this.mediumTextStyle = { font: "30px Arial", fill: "#fff", stroke: '#000000', strokeThickness: 0};

		this.boostMarginX = 100;
		this.boostY = 100;

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
			cost: val,
			add: 0,//Math.floor(Math.random()*15),
			mult: 2
		}
	},

	onClick: function () {
		this.myPoints += this.myIncome;
		this.counterText.text = this.myPoints;
		this.updateBoostTint();
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

	addBoost: function (boost) {
		var b = this.boosts.create(game.camera.width/2,0,"dragon");
		b.cost = boost.cost;
		b.anchor.setTo(0.5,0.5);
		b.inputEnabled = true;
		b.events.onInputDown.add(function (e) {
			if(this.myPoints < boost.cost) return;//not enough points
			this.myPoints -= boost.cost;
			this.counterText.text = this.myPoints;
			this.applyBoost(boost);
			this.boosts.remove(e);
			this.addBoost(this.createBoost());
		},this);

		b.pricetag = game.add.text(0, 50, boost.cost, this.mediumTextStyle);
		b.pricetag.anchor.setTo(0.5,0.5);
		b.addChild(b.pricetag);
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
