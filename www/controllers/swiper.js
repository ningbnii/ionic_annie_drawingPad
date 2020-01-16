.
controller('SwiperCtrl', function($scope, $state, $timeout) {

  $scope.list = [{
      id: 'slider1',
      img: 'img/adam.jpg',
      color: 'rgba(0,0,0)',
    },
    {
      id: 'slider2',
      img: 'img/ben.png',
      color: 'rgba(255,0,0)',
    },
    {
      id: 'slider3',
      img: 'img/mike.png',
      color: 'rgba(255,255,0)',
    }
  ];
  var color = 'rgba(0,0,0)';
  var img = $scope.list[0].img;
  var mySwiper = new Swiper('.swiper-container', {
    autoplay: false, //可选选项，自动滑动
    direction: 'vertical',
    observer: true, //修改swiper自己或子元素时，自动初始化swiper
    observeParents: true, //修改swiper的父元素时，自动初始化swiper
    on: {
      slideChange: function() {

        backgroundLayer.removeAllChild();
        backgroundLayer.removeAllEventListener();
        if (LGlobal.frameRate) {
          // 切换页面，动画会越来越快，应该是在切换页面后，之前的计时器没有清除导致的
          clearInterval(LGlobal.frameRate)
        }
        LInit(20, $scope.list[this.activeIndex].id, w, h, main);
        color = $scope.list[this.activeIndex].color;
        img = $scope.list[this.activeIndex].img;

      },
      slideNextTransitionStart: function() {
        // 从后台搞一个新数据，push到数组中
        $scope.list.push({
          id: 'slider4',
          img: 'img/mike.png',
          color: 'rgba(0,255,0)',
        })
        $scope.$apply();
      },
      slidePrevTransitionStart: function() {
        // 监听第一个滑动
      }

    }
  })


  var w = document.body.clientWidth;
  var h = document.body.clientHeight;


  $timeout(function() {
    if (LGlobal.frameRate) {
      // 切换页面，动画会越来越快，应该是在切换页面后，之前的计时器没有清除导致的
      clearInterval(LGlobal.frameRate)
    }
    LInit(50, 'slider1', w, h, main);
  }, 0)


  var backgroundLayer, loader;


  function main(event) {
    initBackgroundLayer();
    // backgroundLayer.graphics.drawRect(0, '', [0, 0, w, h], true, color);
    loader = new LLoader();
    loader.addEventListener(LEvent.COMPLETE, loadBitmapdata);
    loader.load(img, 'bitmapData');
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

  }

  function initBackgroundLayer() {
    backgroundLayer = new LSprite();
    addChild(backgroundLayer);
  }


  $scope.$on('$ionicView.leave', function() {
    backgroundLayer.removeAllChild();
    backgroundLayer.removeAllEventListener();
  })

  $scope.goToIndex = function() {
    $state.go('index')
  }
})
