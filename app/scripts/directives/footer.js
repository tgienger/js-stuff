angular.module('28Sports.directives.footer', [])
.directive('footer', function () {
    return {
        restrict    : 'A',
        replace     : true,
        templateUrl : '/views/directives/footer.html',
        controller: [ function () {
        }]
    };
});
