angular.module('28Sports.directives.status', [])
.directive('status', function() {
    return {
        restrict: 'E',
        scope: {user: '=', status: '='},
        templateUrl: '/views/directives/status.html',
        controller: ['$scope', function ($scope) {

        }]
    };
});