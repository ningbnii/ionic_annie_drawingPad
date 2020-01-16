.
controller('MoveCtrl', function ($scope, $state) {
  var w = document.body.clientWidth;
  var h = document.body.clientHeight;
  var loader, backgroundLayer, layer, tempLocation;
  var touchPointIdList = [];
  var lenOld;
  var lastScale;
  var midPoint;

  LInit(requestAnimationFrame, 'move', w, h, main);

  function main(event) {
    LMultitouch.inputMode = LMultitouchInputMode.TOUCH_POINT;
    initBackgroundLayer();
    loader = new LLoader();
    loader.addEventListener(LEvent.COMPLETE, loadBitmapdata);
    loader.load('img/adam.jpg', 'bitmapData');


  }


  function initBackgroundLayer() {
    backgroundLayer = new LSprite();
    backgroundLayer.graphics.drawRect(0, '', [0, 0, w, h], true, '#fff');
    addChild(backgroundLayer);

    // mouse_down
    backgroundLayer.addEventListener(LMouseEvent.MOUSE_DOWN, function (event) {
      lastScale = layer.scaleX;
      var flag = false;
      for (var i = 0; i < touchPointIdList.length; i++) {
        if (touchPointIdList[i].touchPointID == event.touchPointID) {
          flag = true;
          break;
        }
      }
      if (!flag) {
        touchPointIdList.push(event);
      }

      // 第二个点的坐标
      if (touchPointIdList.length == 2) {
        tempLocation = {
          x: event.offsetX,
          y: event.offsetY
        };
        lenOld = distanceBetween({
          x: touchPointIdList[0].selfX,
          y: touchPointIdList[0].selfY
        }, {x: touchPointIdList[1].selfX, y: touchPointIdList[1].selfY});

        midPoint = midPointBtw({x:touchPointIdList[0].selfX,y:touchPointIdList[0].selfY},{x:touchPointIdList[1].selfX,y:touchPointIdList[1].selfY});
        // layer.x = midPoint.x;
        // layer.y = midPoint.y;
        // var tempMatrix = new LMatrix();
        // tempMatrix.translate(-midPoint.x,-midPoint.y);
        // layer.transform.matrix = tempMatrix;
      }
    });

    // mouse_move
    backgroundLayer.addEventListener(LMouseEvent.MOUSE_MOVE, function (event) {

      // 只有两个触点才移动
      if (touchPointIdList.length == 2) {
        var flag = false;
        for (var i = 0; i < touchPointIdList.length; i++) {
          if (touchPointIdList[i].touchPointID == event.touchPointID) {
            touchPointIdList[i] = event;
            flag = true;
            break;
          }
        }
        if (event.touchPointID == touchPointIdList[1].touchPointID) {

          // 移动
          var tempx = event.offsetX - tempLocation.x;
          var tempy = event.offsetY - tempLocation.y;
          layer.x += tempx * layer.scaleX;
          layer.y += tempy * layer.scaleY;

          // 缩放
          var lenNew = distanceBetween({
            x: touchPointIdList[0].selfX,
            y: touchPointIdList[0].selfY
          }, {x: touchPointIdList[1].selfX, y: touchPointIdList[1].selfY});
          var scale = (lenNew - lenOld) / lenOld;
          // 最小是原大小
          if (lastScale + scale > 1 && (scale > 0.1 || scale < -0.1)) {

            layer.scaleX = lastScale + scale;
            layer.scaleY = lastScale + scale;
          }


          tempLocation = {
            x: event.offsetX,
            y: event.offsetY
          };
        }
      }
    })
    backgroundLayer.addEventListener(LMouseEvent.MOUSE_UP, function (e) {
      for (var i = 0; i < touchPointIdList.length; i++) {
        if (touchPointIdList[i].touchPointID == e.touchPointID) {
          touchPointIdList.splice(i, 1);
          break;
        }
      }
    })
  }

  function distanceBetween(point1, point2) {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  }

  function angleBetween(point1, point2) {
    return Math.atan2(point2.x - point1.x, point2.y - point1.y);
  }

  function midPointBtw(p1,p2){
    return {
      x:p1.x+(p2.x-p1.x)/2,
      y:p1.y+(p2.y-p1.y)/2
    };
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
    // layer.rotate = 20;
    layer.alpha = 0.4;
  }

  /**
   * 可以使用div控制canvas中的对象，div是在canvas之上显示的，这样布局就方便多了，可以充分发挥canvas和css的特长
   */
  $scope.hideImage = function () {
    layer.visible = !layer.visible;
  }

  $scope.$on('$ionicView.leave', function () {
    backgroundLayer.removeAllChild();
    backgroundLayer.removeAllEventListener();

  })

  $scope.goToIndex = function () {
    $state.go('index')
  }
})
