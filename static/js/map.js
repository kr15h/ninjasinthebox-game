function Map() {
	this.cols = 10;
	this.rows = 10;
	this.containerId = '#map-container';

	this.loadMap = function(fileUrl) {
		console.log(fileUrl);
		this.populateDomTable();
	};

	this.populateDomTable = function(cols, rows) {

		if (arguments.length) {
			this.cols = cols;
			this.rows = rows;
		}
		
		var tableHtml = '';
		tableHtml += '<table>';

		for (var rowsIter = 0; rowsIter < this.rows; rowsIter++) {
			tableHtml += '<tr>';
			for (var colsIter = 0; colsIter < this.cols; colsIter++) {
				tableHtml += '<td></td>';
			}
			tableHtml += '</tr>';
		}

		tableHtml += '</table>';

		$(this.containerId).append(tableHtml);

		this.calcSize();
	}

	this.calcSize = function() {
		var containerWidth = $(this.containerId).width();
		var cellWidth = containerWidth / this.cols;
		var cellHeight = Math.floor(cellWidth);
		$('td').css('height', String(cellHeight) + 'px');
	}

	
}

$(document).ready(function() {
	
	var map = new Map();
	map.loadMap("lorem.json");

	$(window).resize(function() {
		map.calcSize();
	});

});

