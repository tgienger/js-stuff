(function () {

'use strict';

// Database Connection
var db = require('./../config/mysql');
// password verification
// var bcrypt = require('bcrypt');

// query all users from the db
exports.allUsers = function (req, res) {

  db.getConnection(function (err, connection) {
    connection.query('SELECT * FROM users', function (err, rows) {
      if (err) {
        connection.release();
        throw err;
      }
      res.send(rows);
      connection.release();
    });
  });
};


exports.search = function (req, res ) {

  var user = req.query.interest;


  db.getConnection(function (err, connection) {

    connection.query('SELECT id, username, first_name, last_name, email FROM users WHERE username LIKE "%'+user+'%"', function (err, rows) {
      if (err) {
        console.log('error');
        connection.release();
        throw err;
      } else {

        res.send(rows);
        connection.release();

      }
    });
  });
};

})();
