(function () {

  'use strict';
  /*
   * TODO: client side form validation
   */
  angular.module('28experimentApp')
  .controller('RegisterCtrl', ['$scope','$http', '$location', '$rootScope', 'Auth',
   function ($scope, $http, $location, $rootScope, Auth) {

      $scope.url             = '/user/register';
      $scope.guessed         = [];
      $scope.data            = {};
      $scope.modal           = [];
      $scope.zipResults      = [];
      $scope.addedSportsList = [];
      $scope.userSports      = [];

      // Redirect user to login on modal close
      $scope.closeModal = function () {
        $('#registerModal').modal('hide');
        $location.url('/welcome');
      };

      // gets the users location based on ip address
      // probably not very accurate
      // (cellular IP addresses can ping from other states at times)
      // so i'm not sure what
      // I'll actually be doing with it.
      $http.get('http://freegeoip.net/json/?callback')
        .success(function (res) {
          console.log(res);

          $scope.guessed.zip = res.city;
        })
        .error(function (res) {
          console.log(res);
        });

      // Add sport to users list
      $scope.addSport = function (sport) {
          // add sport if not already in list
          if ($scope.addedSportsList.indexOf(sport) === -1 && sport !== undefined) {
            $scope.addedSportsList.push(sport);
            $scope.message = ' Added: ' + sport.sport;
            $scope.userSports.push(sport.id);
          }

        };

      // Remove the sport from users list
      $scope.removeSport = function (sport, name) {
          $scope.addedSportsList.splice(sport, 1);
          $scope.userSports.splice(sport, 1);
          $scope.message = ' Removed: ' + name;
        };

      // Send registration form to server
      $scope.register = function (user) {

        if (user.password === user.confirm) {

          user.sports = $scope.userSports;

          Auth.createUser(user, function (res) {
            // user created.
            if (res.results === 'error'){
              $scope.messages = [{type: res.results, text: res.msg}];
              $scope.modal.message = 'We\'re sorry, but users must be 13 years or older in order to become members of 28Sports. Thanks for your interest!';
              $('#registerModal').modal('show');
            } else {
              $scope.modal.message = 'Your registration a was succes! Check your email for further validation of your account.';
              $('#registerModal').modal('show');
            }
          }, function (err) {
            $scope.messages = [{type: err.results, text: err.msg}];
          });

        } else {
          $scope.messages = [{type: 'error', text: 'Passwords do not match'}];
        }

      };

      $scope.queryZip = function (zip) {
        if (zip !== '') {
          $http({
            url: '/states/:zip',
            method: 'GET',
            params: {zip: zip}
          })
          .success(function (data) {
            $scope.zipResults = data;
          })
          .error(function (data) {
            console.log('error: ' + data);
          });
        } else {
          $scope.zipResults = [];
        }
      };

      $scope.closeMessageAlert = function(index) {
        $scope.messages.splice(index, 1);
      };

    }]);



})();
