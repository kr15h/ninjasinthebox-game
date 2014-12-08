(function () {
	'use strict';

	function WinView() {
		this.container = null; // jQuery object
		this.ninjaMarginTop = 0;
		this.ninjaMarginLeft = -30;
	}

	WinView.prototype.setup = function(jQueryContainerObject) {
		if (arguments.length) {
			this.container = jQueryContainerObject;
			this.container.hide();

			var ninjaMarginLeftPx = String(this.ninjaMarginLeft) + 'px';
			this.container.find('.ninja>img').css('margin-left', ninjaMarginLeftPx);

			var that = this;
			preloadimages(['media/game-over-view-ninja.svg'], function(images) {
				that.onWindowResize();
			});

			// Credits button
			this.container.find('.btn-credits').click(function(){
				ROOT.showCredits();
			});

			// Play again button
			this.container.find('.btn-play').click(function(){
				ROOT.restartGame();
			});


		} else {
			console.log('No container object specified');
		}
	};

	WinView.prototype.show = function() {
		this.container.show();
	};

	WinView.prototype.hide = function() {
		this.container.hide();
	};

	WinView.prototype.calcNinjaTopMargin = function() {
		var ninja = this.container.find('.ninja');
		var ninjaMarginTop = String(ninja.find('img').width() / 1.8) + 'px';
		console.log(ninjaMarginTop);
		ninja.css('margin-top', ninjaMarginTop);
	};

	WinView.prototype.onWindowResize = function() {
		this.calcNinjaTopMargin();
	};

	ROOT.WinView = WinView;

}()); // closure