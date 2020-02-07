angular.module('starter.controllers', [])

  .controller('IndexCtrl', function($scope, $state, $ionicModal) {
    $scope.goToDrawingpad = function () {
      location.replace('#/drawingpad')
    }

  })
