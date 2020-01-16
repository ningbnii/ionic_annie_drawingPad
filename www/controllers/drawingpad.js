.controller('DrawingpadCtrl', function ($scope, $state,MyShape) {
	var w = document.body.clientWidth;
	var h = document.body.clientHeight;
	var stage = new annie.Stage('drawingpad', w, h, 20, annie.StageScaleMode.SHOW_ALL, 0);
	// var bitmap1 = new annie.Bitmap(document.createElement('canvas'));
	// var el = bitmap1.bitmapData;
	// el.width = w;
	// el.height = h;
	// var ctx = el.getContext('2d');
	//
	// stage.addEventListener(annie.MouseEvent.MOUSE_DOWN,onMouseDown);
	//
	// function onMouseDown(e) {
	// 	stage.addEventListener(annie.MouseEvent.MOUSE_MOVE,onMouseMove);
	// }
	//
	// function onMouseMove(e) {
	//
	// }
	var strokes = localStorage.getItem('strokes');
	var penSize = localStorage.getItem('penSize') || 1;
	var alphaSize = localStorage.getItem('alphaSize') || 1;
	var color = localStorage.getItem('color') || 'rgb(0,0,0)';
	var myshape = new MyShape.MyShape(w, h, strokes, false, penSize, alphaSize, color);
	stage.addChild(myshape)
	$scope.goToIndex = function () {
		$state.go('index')
	}
})
