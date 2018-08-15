'use strict';

// Database Connection
var db = require('./../config/mysql');

/**
 *  Sports Queries
 */

exports.listAll = function (req, res) {
    db.getConnection(function (err, connection) {
        if (!err) {
            connection.query('SELECT * FROM sports', function (err, rows) {
                if (err)
                    throw err;

                res.contentType('application/json');
                res.write(JSON.stringify(rows));
                res.end();
            });
        } else {
            res.write(err.toString());
        }
    });
};

exports.userList = function (req, res) {

  var user = req.user[0];

  db.getConnection(function (err, connection) {

    if (err) {

      res.write(err.toString());
      connection.release();

    } else {

      connection.query('SELECT sport FROM user_sports_link INNER JOIN sports ON sport_id= sports.id WHERE user_id = ?', [parseInt(user.id)], function (err, rows) {

        if (err) {

          console.error(err);
          res.statusCode = 500;
          res.send({
            result: 'error',
            err: err.code
          });

        } else {

          res.send(rows);

          connection.release();

        }
      });

    }
  });
};
