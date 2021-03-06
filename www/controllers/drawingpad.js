.
controller('DrawingpadCtrl', function ($scope, $state, MyShape) {
    var w = document.body.clientWidth;
    var h = document.body.clientHeight;
    var stage = new annie.Stage('drawingpad', w, h, 50, annie.StageScaleMode.SHOW_ALL, 0);
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
    var backlayer = new annie.Sprite();
    var strokes = localStorage.getItem('strokes');
    var penSize = localStorage.getItem('penSize') || 1;
    var alphaSize = localStorage.getItem('alphaSize') || 1;
    var color = localStorage.getItem('color') || 'rgb(0,0,0)';
    var myshape = new MyShape(4 * w, 4 * h, strokes, false, penSize, alphaSize, color, backlayer);

    stage.addChild(backlayer);
    backlayer.addChild(myshape);
    $scope.goToIndex = function () {
        // $state.go('index')
        location.replace('#/');
    }

    $scope.clear = function () {
        myshape.clear();
    }
})
