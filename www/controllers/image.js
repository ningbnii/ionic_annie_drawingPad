.controller('ImageCtrl', function($scope, $state) {
  var w = document.body.clientWidth;
  var h = document.body.clientHeight;
  var loader, backgroundLayer, layer;

  var stage = new annie.Stage('image',w,h,20,annie.StageScaleMode.SHOW_ALL,0);
  $scope.shape = new annie.Shape();
  stage.addChild($scope.shape);
  $scope.shape.beginFill('#ff0000');
  $scope.shape.drawCircle(w/2,h/2,40);
  $scope.shape.endFill();


  function main(event) {
    initBackgroundLayer();
    loader = new LLoader();
    loader.addEventListener(LEvent.COMPLETE, loadBitmapdata);
    loader.load('img/adam.jpg', 'bitmapData');

    // pc端监听键盘事件
    LEvent.addEventListener(LGlobal.window, LKeyboardEvent.KEY_DOWN, downshow);
  }

  function downshow(event) {
    alert(event.keyCode)
  }

  function initBackgroundLayer() {
    backgroundLayer = new LSprite();
    addChild(backgroundLayer);
  }

  function loadBitmapdata(event) {
    var bitmapdata = new LBitmapData(loader.content);
    var bitmap = new LBitmap(bitmapdata);

    layer = new LSprite();
    backgroundLayer.addChild(layer);
    layer.addChild(bitmap);

    bitmap.scaleX = w / bitmap.width;
    bitmap.scaleY = w / bitmap.width;
    layer.x = 50;
    layer.y = 100;
    layer.rotate = 20;
    layer.alpha = 0.4;


    layer.addEventListener(LMouseEvent.MOUSE_DOWN, function() {
      alert('ok')
    })




  }

  /**
   * 可以使用div控制canvas中的对象，div是在canvas之上显示的，这样布局就方便多了，可以充分发挥canvas和css的特长
   */
  $scope.hideImage = function() {
    $scope.shape.visible = !$scope.shape.visible;
  }

  $scope.goToIndex = function() {
    $state.go('index')
  }
})
