'use strict';

/* Directives */


angular.module('28experiment.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
  .directive('stateSelect', function() {
    return {
      restrict    : 'E',
      replace     : true,
      templateUrl : '/views/directives/states.html'
    };
  })
  .directive('userSports', function () {
    return {
      restrict  : 'E',
      replace   : true,
      templateUrl : '/views/directives/user_sports.html'
    };
  })
  .directive('person', function(){
    // Runs during compile
    return {
      controller: function($scope, $element, $attrs, $transclude, $http) {
        $http.get('/users/all').success(function (data) {
          $scope.people = data;
        });
      },
      restrict: 'E',
      templateUrl: '/view/directives/person.html',
      link: function($scope, iElm, iAttrs, controller) {

      }
    };
  })
  .directive('monthSelect', function () {
    return {
      restrict : 'E',
      templateUrl: '/views/directives/month_select.html'
    };
  })
  .directive('yearSelect', function () {
    return {
      restrict: 'E',
      templateUrl: '/views/directives/year_select.html',
      controller: ['$scope', function ($scope) {

        $scope.years = [];

        var addYears = function (startYear) {
          var currentYear = new Date().getFullYear(), years = [];
          startYear = startYear || 1930;

          while (currentYear >= startYear) {
            years.push(currentYear--);
          }

          return years;
        };
        // YOB select box values
        $scope.years = addYears();

      }]
    };
  });
