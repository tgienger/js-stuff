'use strict';

angular.module('28Sports.directives.appVersion', [])
.directive('appVersion', ['version', function(version) {
    elm.text(version);
}]);