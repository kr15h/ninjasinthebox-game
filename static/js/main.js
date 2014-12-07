// Init root scope to be accessible from all the closures
var ROOT = {};

$(document).ready(function() {

	var mainView = new ROOT.MainView();
    var gameView = new ROOT.GameView();

	mainView.setup( $('#main-view').first() );
	mainView.show();

    gameView.setup($('#game-view').first(), Blockly);

    ROOT.startGame = function () {
        mainView.hide();
        gameView.show();
    };

	$(window).resize(function(){
		mainView.onWindowResize();
        gameView.onWindowResize();
	});

});