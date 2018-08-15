'use strict';

angular.module('28experimentApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngAnimate',
  'ui.bootstrap',
  '28experiment.directives',
  '28Sports.directives.header',
  '28Sports.directives.footer',
  '28Sports.directives.appVersion',
  '28Sports.directives.sportSelect',
  'ui',
  'ui.bootstrap',
  '28Sports.services'
])
  .config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {

    /**
     * Checks to see if the user is already logged in
     */
    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.post('/loggedin').success(function(user){
        // Authenticated
        if (user !== '0') {
          $rootScope.currentUser = user[0];
          // console.log($rootScope.currentUser);
          $timeout(deferred.resolve, 0);
        }

        // Not Authenticated
        else {
          // console.log('user is not authenticated');
          $rootScope.message = 'You need to log in.';
          $timeout(function(){deferred.reject();}, 0);
          $location.url('/welcome');
        }
      });

      return deferred.promise;
    };

    // HTTP INTERCEPTOR for AJAX errors
    $httpProvider.responseInterceptors.push(['$q', '$location',function($q, $location) {
      return function(promise) {
        return promise.then(
          // Success: just return the response
          function(response){
            return response;
          },
          // Error: check the error status to get only the 401
          function(response) {
            if (response.status === 401){
              $location.url('/welcome');
            }
            return $q.reject(response);
          }
        );
      };
    }]);

    // View Routing
    $routeProvider
      .when('/settings', {
        templateUrl: 'partials/settings',
        controller: 'SettingsCtrl',
        resolve: {
          loggedin: checkLoggedin // Require authentication for this route
        }
      })
      .when('/search', {
        templateUrl: 'partials/search',
        controller: 'SearchCtrl',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .when('/messages', {
        templateUrl: 'partials/messages',
        controller: 'MessageCtrl',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .when('/welcome', {
        templateUrl: 'partials/welcome',
        controller: 'WelcomeCtrl'
      })
      .when('/register', {
        templateUrl: 'partials/register',
        controller: 'RegisterCtrl'
      })
      .when('/profile', {
        templateUrl: 'partials/profile',
        controller: 'ProfileCtrl',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .when('/:sport', {
        templateUrl: 'partials/dashboard',
        controller: 'DashboardCtrl',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .when('/:sport/:group', {
        templateUrl: 'partials/dashboard',
        controller: 'DashboardCtrl',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .otherwise({
        redirectTo: '/dashboard'
      }); // End View Routing


    $locationProvider.html5Mode(true);
  }]);
