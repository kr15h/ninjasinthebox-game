// Init root scope to be accessible from all the closures
var ROOT = {};

$(document).ready(function() {

	var mainView = new ROOT.MainView();

	mainView.setup( $('#main-view').first() );
	mainView.show();

	$(window).resize(function(){
		mainView.onWindowResize();
	});

    /* Blockly stuff */
    Blockly.Blocks.maze_move = {
        // Block for moving forward/backward
        helpUrl: 'http://code.google.com/p/blockly/wiki/Move',
        init: function() {
            this.setHSV(184, 1.00, 0.74);
            this.appendDummyInput()
                .appendTitle("move forward"/*new Blockly.FieldDropdown(this.DIRECTIONS)*/, 'DIR');
            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setTooltip("move forward");
        }
    };
    Blockly.Blocks.maze_move.DIRECTIONS =
        [['move forward', 'moveForward'],
        ['move backward', 'moveBackward']];
    Blockly.Generator.get('JavaScript').maze_move = function() {
        // Generate JavaScript for moving forward/backward
        //var dir = this.getTitleValue('DIR');
        return /*dir + */'moveForward();\n';
    };
    Blockly.Blocks.maze_turn = {
        // Block for turning left or right.
        helpUrl: 'http://code.google.com/p/blockly/wiki/Turn',
        init: function() {
        this.setHSV(184, 1.00, 0.74);
        this.appendDummyInput()
            .appendTitle(new Blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip("turn left or right");
        }
    };
    Blockly.Blocks.maze_turn.DIRECTIONS =
        [['turn left' + ' \u21BA', 'turnLeft'],
        ['turn right' + ' \u21BB', 'turnRight']];
    Blockly.Generator.get('JavaScript').maze_turn = function() {
        // Generate JavaScript for turning left or right.
        var dir = this.getTitleValue('DIR');
        return dir + '();\n';
    };
    Blockly.inject(document.getElementById('blockly'), {
        path: ".",
        trashcan: true,
        toolbox: '<xml id="toolbox" style="display: none;">' +
            '<block type="maze_move"></block>' +
            '<block type="maze_turn"><title name="DIR">turnLeft</title></block>' +
            '<block type="maze_turn"><title name="DIR">turnRight</title></block></xml>',
    });
});