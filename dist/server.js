'use strict';

var express = require('express'),
    mysql = require('mysql'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt');

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Application Config
var config = require('./lib/config/config');

var app = express();

// Express settings
require('./lib/config/express')(app);

// Routing
require('./lib/routes')(app, passport);

// Database
var db = require('./lib/config/mysql');

/**
 * Passport User Login
 */
passport.use(new LocalStrategy(function (username, password, done) {
  db.getConnection(function (err, connection) {

    var query = 'SELECT * FROM users where username = ? LIMIT 1';

    if (err) {throw err;}
    connection.query(query, [username], function (err, user) {

      if (err) { return done(err); }

      if (user.length > 0) {

        if(!user){
          connection.release();
          return done(null, false, { message: 'Login Failed.' });
        }

        var hash = user[0].password;
        password = connection.escape(password);
        // Asynchronous hash checking
        bcrypt.compare(password, hash, function(err, match) {
          if (err) {
            connection.release();
            throw err;
          } else if (match){
            connection.release();
            return done(null, user);
          } else {
            connection.release();
            return done(null, false, { message: 'login failed.' });
          }
        }); // compare pw w/hash

      }
      else {
        connection.release();
        return done(null, false);
      }
    });
  });
}));

// Serialize user for session
passport.serializeUser(function (user, done) {
  done(null, user);
});

// Deserialize user for session / logout
passport.deserializeUser(function (user, done) {
  db.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      throw err;
    } else {

      connection.query('SELECT * FROM users WHERE id = ?', parseInt(user[0].id), function (err, user) {
        if (err) {
          throw err;
        } else {

          done(err, user);
          connection.release();
        }
      });
    }
  });
});
// End Passport

// Run Server
app.listen(config.port, function () {
  console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
