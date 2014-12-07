// Init root scope to be accessible from all the closures
var ROOT = {};

$(document).ready(function() {

	var mainView = new ROOT.MainView();

	mainView.setup( $('#main-view').first() );
	mainView.show();

	$(window).resize(function(){
		mainView.onWindowResize();
	});

});