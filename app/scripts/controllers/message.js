(function () {
  'use strict';

  angular.module('28experimentApp')
    .controller('MessageCtrl', ['$scope', '$http', '$timeout','Messages', function ($scope, $http, $timeout, Messages) {
      $scope.displayMessage      = {};
      $scope.displayMessage.body = 'click a message to view';
      $scope.replyStarted = false;

      // TODO:
      // Setup the server to only send data back to user if new information
      // exists on the database. Otherwise, don't bother resending the exact
      // same data back to the user.

      // 'GET' inbox items
      $scope.getInbox = function () {
        Messages.get(function (res) {
          $scope.messages = res;
        }, function (err) {
          console.log(err);
        });
      };

      var timer;
      // 'GET' inbox messages
      // every 5 seconds
      (function getMsg() {
        $scope.getInbox();

        timer = $timeout(getMsg, 5000);
      })();

      // 'GET' sent items when
      // the sent tab is opened
      $scope.getSent = function () {
        $scope.displayMessage = {};
        $scope.displayMessage.body = 'click to view a message you\'ve sent';
        $http.get('/user/messages/sent')
        .success(function (data) {
          $scope.sent = data.json;
        });
      };

      // 'GET' trash items when
      // the trash tab is opened
      $scope.getTrash = function () {
        $scope.displayMessage = {};
        $scope.displayMessage.body = 'click to view a message you\'ve trashed';
        $http.get('/user/messages/trash')
        .success(function (data) {
          $scope.trashData = data;
        });
      };

      $scope.viewMessage = function (message) {
        $scope.displayMessage = message;
        $scope.replyStarted = false;
        $scope.reply.body = '';

        if (!message.isRead) {
          $http.put('/user/message/markread/'+message.id)
          .success(function () {})
          .error(function (err) {
            console.log(err);
          });
        }
      };

      $scope.viewSent = function (msg) {
        $scope.displayMessage = msg;
      };

      $scope.trash = function (msg) {
        $http.put('/user/message/'+msg)
        .success(function (res) {

          Messages.get(function (res) {
            $scope.messages = res;
          }, function (err) {
            console.log(err);
          });

        })
        .error(function (err) {
          console.log(err);
        });
      };

      $scope.unTrash = function (msg) {
        $http.put('/user/message/'+msg)
        .success(function (res) {

          $http.get('/user/messages/trash')
          .success(function (data) {
            $scope.trashData = data;
          });

        })
        .error(function (err) {
          console.log(err);
        });
      };

      $scope.delete = function (msg) {
        // finish http.del
        $http.del('/user/message/'+msg.id)
        .success(function () {
          console.log('deleted');
        })
        .error(function (err) {
          console.log(err);
        });
      };

      $scope.openReply = function () {
        $scope.replyStarted = !$scope.replyStarted;
        $timeout(replyFocus, 500);
      };

      $scope.reply = function (msg, text) {
        var data = {
          recipient_id: msg.user_id,
          body: text
        };

        $http.post('/user/message', data)
        .success(function (res) {
          // TODO: set response msg
          $scope.replyStarted = false;
          $scope.reply.body = '';
          $scope.alerts = [{type: res.results, text: res.msg}];
        })
        .error(function (err) {
          console.log(err);
        });
      };

      $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
      };

      function replyFocus(){
        angular.element('#replybox').focus();
      }

      // kill the pm count when header is no longer
      // a part of the view (welcome/register)
      $scope.$on('$locationChangeStart', function () {
        $timeout.cancel(timer);
      });

      $('#myTab a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
      });

      (function () {
        $('#myTab a:first').tab('show');
      })();

    }]);

})();
