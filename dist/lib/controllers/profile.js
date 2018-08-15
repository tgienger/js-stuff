(function () {

  'use strict';

  // Databse info
  var db     = require('./../config/mysql');
  // var bcrypt = require('bcrypt');


  exports.update = function (req, res) {
    var user = req.user[0];
    var post = req.body;

    db.getConnection(function (err, connection ) {
      if (err) {
        connection.release();
        throw err;
      }

      var sql = 'UPDATE users SET ';

      if(post.zip) {
        sql += 'zip = ' + connection.escape(post.zip);
      }

      if(post.gender) {
        if(post.zip) {
          sql += ', ';
        }
        sql += 'gender = ' + connection.escape(post.gender);
      }

      if(post.favorite_athlete) {
        if(post.zip || post.gender) {
          sql += ', ';
        }
        sql += 'favorite_athlete = ' + connection.escape(post.favorite_athlete);
      }

      if(post.bio) {
        if(post.zip || post.gender || post.favorite_athlete) {
          sql += ', ';
        }
        sql += 'bio = ' + connection.escape(post.bio);
      }

      sql += ' WHERE id = ?';

      connection.query(sql, user.id, function (err, rows) {
        if (err) {
          connection.release();
          res.send({
            results: 'error',
            msg: 'Profile failed to be updated',
            err: err
          });

        } else {
          connection.release();
          res.send({
            results: 'success',
            msg: 'Profile was successfully updated',
            json: rows,
            length: rows.length
          });

        }
      });
    });
  };

  exports.query = function (req, res) {
    var user = req.user[0];

    db.getConnection (function (err, connection ) {
      connection.query('SELECT users.*, _geo.state FROM users INNER JOIN _geo ON _geo.zip = users.zip WHERE id = ? LIMIT 1', parseInt(user.id), function (err, rows) {
        // handle error
        if (err) {
          connection.release();
          res.send({
            results: 'error',
            err: err.code
          });
        }
        // no response
        if(rows.length === 0) {
          connection.release();
          res.send({
            results: 'error',
            err: err
          });
        }
        connection.release();
        res.send({
          results: 'success',
          json: rows,
          // length: rows.length
        });

      });
    });
  };

})();
