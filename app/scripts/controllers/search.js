'use strict';

angular.module('28experimentApp')
.controller('SearchCtrl', ['$scope', '$http', function ($scope, $http) {

  $scope.sportList = [];
  $scope.searchFilter = {};
  $scope.search = {};

  $http.get('/user/sports').success(function (data) {
    $scope.sportList = data;
  });

  // $http.get('/users/all').success(function (data) {
  //   $scope.search = data;
  // });

}]);
