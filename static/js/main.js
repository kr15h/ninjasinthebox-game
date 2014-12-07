// Init root scope to be accessible from all the closures
var ROOT = {};

$(document).ready(function() {

	// Init main view
	var mainView = new ROOT.MainView();
	mainView.setup( $('#main-view').first() );
	mainView.show();

	// Init game view
	var gameView = new ROOT.GameView();
	gameView.initBlockly(Blockly);

	// Init game over view
	var gameOverView = new ROOT.GameOverView();
	gameOverView.setup( $('#game-over-view').first() );

	$(window).resize(function(){
		mainView.onWindowResize();
		gameOverView.onWindowResize();
	});

});