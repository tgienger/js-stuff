(function () {

  'use strict';

  angular.module('28experimentApp')
  .controller('SettingsCtrl', ['$scope','$rootScope', '$http', 'Settings',
   function ($scope, $rootScope, $http, Settings) {

      $scope.users    = [];
      $scope.blockedUser = {};

      $scope.init = function () {

        Settings.mySettings(function (data) {
          $scope.blockedUser = data;
        }, function (err) {
          $rootScope.message = 'Error: ' + err;
        });

      };


      $scope.addBlocked = function (user) {
        if (user) {

          Settings.addBlocked({
            blockUser: user,
            userId: $rootScope.currentUser.id
          }, function (res) {
            //response
            $scope.messages = [{ type: res.result, text: user + ' ' + res.msg }];

            $scope.blocked.user = '';

            if (res.result === 'success') {
              $scope.init();
            }

          }, function (err) {
            //error
            console.log('error ' + err);
          });

        }

      };


      $scope.removeBlocked = function (index, user) {

        if (user) {

          Settings.removeBlocked({
            blockedUser: user.user_id,
            userId: $rootScope.currentUser.id
          }, function (res) {

              $scope.messages = [{ type: res.result, text: user.username + ' ' + res.msg }];

              if (res.result === 'success') {
                $scope.init();
              }

            }, function (err) {
            console.log('err: ' + err);
          });

        }
      };


      $scope.userUpdate = function (user) {

        if (user) {

          if (user.newPass === user.confirm || user.newPass === '') {

            Settings.update({

              id: $rootScope.currentUser.id,
              password: user.newPass,
              email: user.email,
              cpass: user.password

            }, function (res) {

              $scope.alerts = [{ type: res.result, text: res.msg || res.err }];
              $scope.user.newPass  = '';
              $scope.user.confirm  = '';
              $scope.user.password = '';

              // $scope.init();

            }, function (err) {

              console.log(err);

            });

          } else {

            $scope.alerts = [{ type: 'error', text: 'passwords do not match' }];

          }

        }

      };

      $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
      };

      $scope.closeMessageAlert = function(index) {
        $scope.messages.splice(index, 1);
      };

      $scope.init();
    }]);

})();
