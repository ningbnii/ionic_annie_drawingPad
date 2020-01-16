.controller('AnimationCtrl', function($scope, $state) {
  var w = document.body.clientWidth;
  var h = document.body.clientHeight;

  LInit(100, 'animation', w, h, main);

  var backgroundLayer, player, player2;
  var walkDown = true;
  var i = 0;

  function main(event) {
    initBackgroundLayer();
    var loader = new LLoader();
    loader.addEventListener(LEvent.COMPLETE, loadBitmapdata);
    loader.load('img/player.png', 'bitmapData');
  }

  function loadBitmapdata(event) {
    var backLayer = new LSprite();
    backgroundLayer.addChild(backLayer);
    var list = LGlobal.divideCoordinate(480, 630, 3, 4);
    var data = new LBitmapData(event.target, 0, 0, 120, 210);
    player = new LAnimation(backLayer, data, list);

    player.y = -player.bitmap.height;
    player.x = (w - player.bitmap.width) / 2;

    backgroundLayer.addEventListener(LEvent.ENTER_FRAME, onEnterFrame);
  }

  function onEnterFrame(event) {
    // console.log(LGlobal.requestIdArr)
    player.onframe();
    if (walkDown) {
      if (player.y < h) {
        player.y += 10;
      }
    }
    if (!walkDown) {
      player.y -= 10;
    }

    if (player.y >= h) {
      walkDown = false;
      player.setAction(1, 0);
    }
    if (player.y <= -player.bitmap.height) {
      player.setAction(0, 0);
      walkDown = true;
    }


  }


  function initBackgroundLayer() {
    backgroundLayer = new LSprite();
    addChild(backgroundLayer);
  }




  $scope.$on('$ionicView.leave', function() {
    backgroundLayer.removeAllChild();
    backgroundLayer.removeAllEventListener();
    // window.cancelAnimationFrame(LGlobal.requestId)
  })

  $scope.goToIndex = function() {
    $state.go('index')
  }
})
