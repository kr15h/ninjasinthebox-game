(function () {
	'use strict';

	function GameOverView() {
		this.container = null; // jQuery object
		this.ninjaMarginTop = 0;
		this.ninjaMarginLeft = -30;
	}

	GameOverView.prototype.setup = function(jQueryContainerObject) {
		if (arguments.length) {
			this.container = jQueryContainerObject;
			this.container.hide();

			var ninjaMarginLeftPx = String(this.ninjaMarginLeft) + 'px';
			this.container.find('.ninja>img').css('margin-left', ninjaMarginLeftPx);

			var that = this;
			preloadimages(['media/game-over-view-ninja.svg'], function(images) {
				that.onWindowResize();
			});
		} else {
			console.log('No container object specified');
		}
	};

	GameOverView.prototype.show = function() {
		this.container.show();
	};

	GameOverView.prototype.hide = function() {
		this.container.hide();
	};

	GameOverView.prototype.calcNinjaTopMargin = function() {
		var ninja = this.container.find('.ninja');
		var ninjaMarginTop = String(ninja.find('img').width() / 1.8) + 'px';
		console.log(ninjaMarginTop);
		ninja.css('margin-top', ninjaMarginTop);
	};

	GameOverView.prototype.onWindowResize = function() {
		this.calcNinjaTopMargin();
	};

	ROOT.GameOverView = GameOverView;

}()); // closure