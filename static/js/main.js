// Init root scope to be accessible from all the closures
var ROOT = {};

$(document).ready(function() {

	// Init main view
	var mainView = new ROOT.MainView();
	mainView.setup( $('#main-view').first() );
	mainView.show();

	// Init game view
	var gameView = new ROOT.GameView();
	gameView.setup($('#game-view').first(), Blockly);

	// Init game over view
	var gameOverView = new ROOT.GameOverView();
	gameOverView.setup( $('#game-over-view').first() );

	$(window).resize(function(){
		mainView.onWindowResize();
        gameView.onWindowResize();
		gameOverView.onWindowResize();
	});

    ROOT.startGame = function () {
        mainView.hide();
        gameView.show();
    };

});