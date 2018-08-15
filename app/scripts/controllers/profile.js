(function () {

  'use strict';

  angular.module('28experimentApp')
    .controller('ProfileCtrl', ['$scope', '$http', '$rootScope', 'Messages',
     'MyPosts','$filter', 'SportService', 'Profile',
     function ($scope, $http, $rootScope, Messages, MyPosts, $filter, SportService, Profile ) {

      $scope.info      = [];
      $scope.sportList = [];

      $scope.days      = [];
      for (var i = 1; i < 32; i++) {
        $scope.days.push(i);
      }

      // get users posts and age
      $scope.posts     = MyPosts.query();
      var now          = $filter('date')(new Date(), 'yyyy');
      $scope.age       = now - $rootScope.currentUser.birthday;

      // get profile information
      $scope.queryInfo = function () {
        //get sports list
        $http.get('/user/sports').success(function (data){
          $scope.sports = data;
        });
        //get profile
        Profile.me(function (data) {
          $scope.info = data[0];
        });
        //get interests
        Profile.interests(function (data) {
          $scope.interests = data;
        });
      };

      $scope.queryInterests = function (interest) {
        if (interest !== '') {
          $http({
            url: '/interests/search',
            method: 'GET',
            params: {interest: interest}
          })
          .success(function (data) {
            $scope.queryResults = data;
          })
          .error(function (data) {
            console.log('error: ' + data);
          });
        } else {
          $scope.queryResults = [];
        }
      };

      $scope.addInterest = function (interest) {
        // if (interest) {
        //   Profile.addInterest({
        //     interest: interest
        //   }, function (data) {
        //     $scope.queryInfo();
        //     console.log(data);
        //   }, function (err) {
        //     console.log(err);
        //   });
        // }
      };

      $scope.delInterest = function (interest) {
        // if (interest) {
        //   Profile.delInterest({
        //     interest: interest
        //   }, function (data) {
        //     $scope.queryInfo();
        //     console.log(data);
        //   }, function (err) {
        //     console.log(err);
        //   });
        // }
      };

      $scope.update = function (info) {
        if (info === undefined) {
          console.log('no changes were made');
        } else {
          $http.put('/user/profile/update', info)
          .success(function (res) {
            $scope.messages = [{type: res.results, text: res.msg}];
            $scope.queryInfo();
          })
          .error(function (res) {
            // handle better, show alrt
            console.log('error ', res);
          });
        }
      };

      $scope.removeSport = function (sport) {
        if ($scope.sports.length > 1) {
          SportService.remove({
            id: sport
          }, function (res) {
            $scope.queryInfo();
          }, function (err) {
            console.log(err);
          });
        } else {
          $scope.sportMessages = [{type: 'error' , text: 'you must be following at least one sport'}];
        }
      };

      $scope.addSport = function (sport) {
        for (var i = 0; i < $scope.sports.length; i++) {
          console.log($scope.sports[i].id);
          if (sport.id === $scope.sports[i].id) {
            return;
          }
        }
        SportService.add({
          id: sport.id
        }, function (res) {
          $scope.queryInfo();
        }, function (err) {
          console.log(err);
        });
      };

      $http.get('/sports/list').success(function (data) {
        $scope.sportList = data;
      }).error(function (data) {
        console.log(data);
      });

      $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
      };

      $scope.closeMessageAlert = function(index) {
        $scope.messages.splice(index, 1);
      };

      $scope.closeSportAlert = function (index) {
        $scope.sportMessages.splice(index, 1);
      };

      $scope.queryInfo();

    }]);

})();
