(function () {
  'use strict';

  angular.module('28Sports.directives.header', [])
  .directive('header', function () {
      return {
          restrict    : 'A',
          replace     : true,
          scope       : {user: '=', active: '@'},
          templateUrl : '/views/directives/header.html',
          controller  : ['$scope', '$http', 'Auth', '$rootScope', 'Message', '$timeout', function($scope, $http, Auth, $rootScope, Message, $timeout) {

            var timer;
            // Check users PM count every 15 seconds
            // TODO: Move header outside of individual views
            // so it only refreshes on timer instead of every
            // view change.
            (function tick() {
              $scope.messageCount = Message.count();
              timer = $timeout(tick, 5000);
            })();

            // ... Logout
            $scope.logout = function () {
              Auth.logout(function() {
                // $location.url('/welcome');
              }, function () {
                $rootScope.message = 'Failed to logout';
              });
            };

            // kill the pm count when header is no longer
            // a part of the view (welcome/register)
            $scope.$on('$locationChangeStart', function () {
              $timeout.cancel(timer);
            });

          }]
        };
    });

})();
