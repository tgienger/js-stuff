(function () {

  'use strict';

  angular.module('28experimentApp')
    .controller('DashboardCtrl', ['$scope', '$routeParams', '$http', '$rootScope', 'Messages',
     function ($scope, $routeParams, $http, $rootScope, Messages ) {


      $http.get('/user/sports').success(function (data) {
        $scope.sportList = data;
      });



      // $scope.alerts = [{type: 'error', text: 'Your account has been updated successfully.'}];
      // $scope.messages = [{type: 'success', text: 'You have new messages!'}];

      // $http.jsonp('http://experiment.28sports.com:3000/posts?callback=JSON_CALLBACK', {
      //   params: {
      //     user_id   : $scope.user.user_id,
      //     county    : $routeParams.group != 'friends' && $routeParams.group != 'follow' ? $scope.user.county : '',
      //     group     : $routeParams.group || '',
      //     sports    : [$routeParams.sport || 'all'],
      //     parent_id : 0
      //   }
      // }).then(function(response) {
      //   sportsbuddies.streamPosts($scope.posts || ($scope.posts = []), response.data.results);
      // });

      $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
      };

      $scope.closeMessageAlert = function(index) {
        $scope.messages.splice(index, 1);
      };

    }]);

})();
