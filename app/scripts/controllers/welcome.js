(function () {

  'use strict';

  angular.module('28experimentApp')
  .controller('WelcomeCtrl', ['$scope', '$http','$rootScope', '$location', 'Auth', function ($scope, $http, $rootScope, $location, Auth) {

    $scope.data  = {};
    $scope.url   = '/login';
    $scope.user  = {};

    $scope.login = function (form) {
      if(form.$valid) {

        Auth.login({
          username: $scope.user.username,
          password: $scope.user.password
        },
        function(res) {
          $location.url('/dashboard');
        },
        function(err) {
          $scope.messages = [{type: 'error', text: err}];
        });

      }
    };

    $scope.closeMessageAlert = function(index) {
      $scope.messages.splice(index, 1);
    };

  }]);

})();
