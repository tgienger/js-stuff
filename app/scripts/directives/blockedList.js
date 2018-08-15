angular.module('28experimentApp')
  .directive('blocked', function () {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/views/directives/blocked.html',
      controller: ['$scope', function ($scope) {

      }]
    }
  })
