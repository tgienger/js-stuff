/**
 *   Sports select box directive
 *
 *   Displays a list of all available sports from
 *   the database into a select - option element.
 *
 */
angular.module('28Sports.directives.sportSelect', [])
.directive('sportSelect', function () {
    return {
        restrict    : 'E',
        replace     : true,
        templateUrl : '/views/directives/sport_select.html',
        controller  : ['$scope', '$http', function($scope, $http) {

            // GET list of sports from DB
            $scope.selectedSport = null;
            $scope.sportList = [];

            $http.get('/sports/list').success(function(data) {
                $scope.sportList = data;
                // console.log($scope.sportList);
            });

      }]
    };
});
