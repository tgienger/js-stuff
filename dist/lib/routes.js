(function () {

  'use strict';

  var api     = require('./controllers/api'),
      index   = require('./controllers'),
      sport   = require('./controllers/sport'),
      user    = require('./controllers/user'),
      blocked = require('./controllers/blocked'),
      users   = require('./controllers/users'),
      profile = require('./controllers/profile');


  /**
   * Application routes
   */

  // authorization check
  module.exports = function(app, passport) {


    var auth = function (req, res, next) {
      if (!req.isAuthenticated()) {
        res.send(401);
      }
      else {
        next();
      }
    };


    // Server API Routes

    // Sports
    app.get('/sports/list', sport.listAll);
    // user oriented
    app.post('/user/register', user.register);
    app.put('/user/update', auth, user.update);
    app.get('/user/settings', auth, user.mySettings);
    app.get('/user/sports/all', auth, sport.userList);
    app.get('/user/posts', auth, user.posts);

    //profile
    app.get('/user/profile', auth, profile.query);
    app.put('/user/profile/update', auth, profile.update);

    // list of all users
    app.get('/users/search', auth, users.search);

    // user messages
    app.get('/user/messages/all', auth, user.messages);

    // user blocked list
    app.post('/user/blocked/add', auth, blocked.addBlocked);
    app.put('/user/blocked/remove', auth, blocked.removeBlocked);
    app.get('/user/blocked/list', auth, blocked.listBlocked);

    // User login
    app.post('/login', passport.authenticate('local'), function (req, res) {
      res.send(req.user);
    });
    // User logout
    app.post('/logout', function (req, res) {
      req.logOut();
      res.send(200);
    });
    // Check to see if the user is currently logged in
    app.post('/loggedin', function (req, res) {
      res.send(req.isAuthenticated() ? req.user : '0');
    });


    // All undefined api routes should return a 404
    app.get('/api/*', function (req, res) {
      res.send(404);
    });
    app.get('/user/*', function (req, res) {
      res.send(404);
    });

    // All other routes to use Angular routing in app/scripts/app.js
    app.get('/partials/*', index.partials);
    app.get('/*', index.index);
  };

})();
