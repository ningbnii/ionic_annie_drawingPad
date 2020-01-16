// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.cordova && window.cordova.InAppBrowser) {
        window.open = window.cordova.InAppBrowser.open;
      }

      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })

  .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.views.transition('none');

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

      .state('index', {
        url: '/index',
        templateUrl: 'templates/index.html',
        controller: 'IndexCtrl'
      })
      .state('image', {
        url: '/image',
        templateUrl: 'templates/image.html',
        controller: 'ImageCtrl'
      })
      .state('draw', {
        url: '/draw',
        templateUrl: 'templates/draw.html',
        controller: 'DrawCtrl'
      })
      .state('drawTriangles', {
        url: '/drawTriangles',
        templateUrl: 'templates/drawTriangles.html',
        controller: 'DrawTrianglesCtrl'
      })
      .state('animation', {
        url: '/animation',
        templateUrl: 'templates/animation.html',
        controller: 'AnimationCtrl'
      })
      .state('swiper', {
        url: '/swiper',
        templateUrl: 'templates/swiper.html',
        controller: 'SwiperCtrl'
      })
      .state('move', {
        url: '/move',
        templateUrl: 'templates/move.html',
        controller: 'MoveCtrl'
      })
      .state('drawingpad', {
        url: '/drawingpad',
        templateUrl: 'templates/drawingpad.html',
        controller: 'DrawingpadCtrl'
      })
      .state('download', {
        url: '/download',
        templateUrl: 'templates/download.html',
        controller: 'DownloadCtrl'
      })

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/index');

  });
