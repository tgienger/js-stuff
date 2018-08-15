(function () {

  'use strict';

  var services = angular.module('28Sports.services', [])
  .value('version', '0.1')
  /**
   *  28sports utility service
   */
  .factory('sportsbuddies', function() {
      function sort_by_gmdate_created(a, b) {
        return b.gmdate_created - a.gmdate_created;
      }

      return {
        streamPosts: function(viewModel, results) {
          var merged = viewModel.concat(results);

          angular.forEach(results, function(post) {
            post.replies = post.replies || [];

            if (post.parent_id > 0) {
              angular.forEach(merged, function(parent) {
                if (parent.post_id == post.parent_id) {
                  parent.replies.push(post);
                }
              });
            } else {
              viewModel.push(post);
            }
          });

          angular.forEach(viewModel, function(parent) {
            if (angular.isArray(parent.replies)) {
              parent.replies.sort(sort_by_gmdate_created);
            }
          });

          viewModel.sort(sort_by_gmdate_created);
        }
      };
    });

  /**
   * Authorization services
   */
  services.factory('Auth', ['$http', '$cookieStore', function ($http, $cookieStore) {

    return {

      login: function (user, success, error) {
        $http.post('/login', user).success(function (user) {
          //successful login
          success(user);
        }).error(error);
      },

      logout: function (success, error) {
        $http.post('/logout').success(function() {
          //user logged out
        }).error(error);
      },

      isLoggedIn: function (user, success, error) {
        $http.get('/loggedin').success(function (user) {
          success(user);
        }).error(error); // end login check
      },

      createUser: function (user, success, error) {
        $http.post('/user', user).success(function (user) {
          success(user);
        }).error(error);
      }
    };

  }]);

  /**
  * User Settings services
  */
  services.factory('Settings', ['$http', function ($http) {

    return {

      mySettings: function (success, error) {
        $http.get('/user').success(function (users) {
          success(users);
        }).error(error);
      },

      addBlocked: function (user, success, error) {
        $http.post('/user/blocked/add', user).success(function (res) {
          success(res);
        }).error(error);
      },

      removeBlocked: function (user, success, error) {
        $http.put('/user/blocked/remove', user).success(function (res) {
          success(res);
        }).error(error);
      },

      update: function (user, success, error) {
        $http.put('/user', user).success(function (response) {
          success(response);
        }).error(error);
      }
    };
  }]);

  services.factory('Profile', ['$http', function ($http) {
    return {

      me: function (success, error) {
        $http.get('/user/profile/me').success(function (res) {
          success(res);
        }).error(error);
      },

      interests: function (success, error) {
        $http.get('/interests').success(function (res) {
          success(res);
        }).error(error);
      },

      addInterest: function (interest, success, error) {
        $http.post('/interests', interest).success(function (res) {
          success(res);
        }).error(error);
      },

      delInterest: function (interest, success, error) {
        console.log('deletion began');
        $http.put('/interests', interest).success(function (res) {
          success(res);
        }).error(error);
      }

    };
  }]);

  services.factory('SportService', ['$http', function ($http) {
    return {

      remove: function (id, success, error) {
        $http.delete('/user/sport/'+id.id).success(function (res) {
          success(res);
        }).error(error);
      },

      add: function (id, success, error) {
        $http.put('/user/sport/'+id.id).success(function (res) {
          success(res);
        }).error(error);
      }
    };
  }]);

  services.factory('Message', ['$resource', function ($resource) {
    return $resource('/user/messages/count',{},{
      count:{method: 'GET', params: {}, isArray: false}
    });
  }]);

  services.factory('Messages', ['$http', function ($http) {
    return {

      get: function (success, error) {
        $http.get('/user/messages').success(function (res) {
          success(res);
        }).error(error);
      }

    };
  }]);

  services.factory('MyPosts', ['$resource', function($resource){
    return $resource('/user/posts', {}, {
      query: { method: 'GET', params: {}, isArray: true }
    });
  }]);

})();
