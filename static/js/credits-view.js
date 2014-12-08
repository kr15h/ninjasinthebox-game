(function () {
	'use strict';

	function CreditsView() {
		this.container = null; // jQuery object
	}

	CreditsView.prototype.setup = function(jQueryContainerObject) {
		if (arguments.length) {
			this.container = jQueryContainerObject;
			this.container.hide();

			this.container.find('.btn-main').click(function(){
				ROOT.restartGame();
			});
		} else {
			console.log('No container object specified');
		}
	};

	CreditsView.prototype.show = function() {
		this.container.show();
	};

	CreditsView.prototype.hide = function() {
		this.container.hide();
	};

	ROOT.CreditsView = CreditsView;

}()); // closure