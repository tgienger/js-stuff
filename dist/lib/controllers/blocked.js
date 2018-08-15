(function () {

  'use strict';

  // Database Connection
  var db = require('./../config/mysql');
  var bcrypt = require('bcrypt');

  /**
   * This file contains functions to
   * add/remove and list blocked users
   */

  /**
   * Remove Users from blocked list
   */
  exports.removeBlocked = function (req, res) {


    var post = req.body;
    var user = req.user[0];


    db.getConnection(function (err, connection) {
      if (err) {

        res.write(err.toString());

      } else {

        var blockedUser = connection.escape(post.blockedUser);
        var userId = connection.escape(parseInt(user.id));


        var sql = 'DELETE FROM blocking WHERE user_id = '+
          blockedUser+
          ' AND blocking_user_id = '+
          userId+
          ' and timestamp + INTERVAL 5 MINUTE < NOW() ';


        connection.query(sql, function (err, results) {

          if (err) {

            console.error(err);
            res.statusCode = 500;
            res.send({
              result: 'error',
              err: err.code
            });

            connection.release();

          } else {

            // User successfully removed
            if(results.affectedRows > 0 ){
              res.send({
                result: 'success',
                msg: 'has been removed',
                err: '',
                json: results[0],
                length: results.length
              });
              connection.release();

            } else {
              // User was not removed
              res.send({
                result: 'failed',
                msg: 'was recenly added, wait 5 minutes and try again',
                err: '',
                json: results[0],
                length: results.length
              });
              connection.release();

            }

          } // end err if/else


        }); // end connection.query

      } // end else


    });

  };

  /**
   * Add to users blocked list
   */
  exports.addBlocked = function (req, res) {

      var post = {
        'userId'    : req.body.userId,
        'blockUser' : req.body.blockUser
      };
      var user = req.user[0];


      db.getConnection(function (err, connection) {

        if (err) {

          res.write(err.toString());

        } else {

          // Get the id for the user to be blocked
          var sql = 'SELECT id FROM users WHERE username = ? LIMIT 1';


          var insert = [
            [post.blockUser]
          ];


          connection.query(sql, [insert], function (err, results) {

            if (err) {
              throw err;
            } else {

              if (results.length > 0) {
               // If the user exists

                var blockedId = results[0].id;


               // Lets see if that use has already been blocked
                sql = 'SELECT id FROM blocking WHERE user_id = "'+
               blockedId+
               '" and blocking_user_id = "'+
               connection.escape(parseInt(user.id))+
               '" LIMIT 1';


                connection.query(sql, function (err, results) {
                  if (err) {throw err;}

                  if (results.length > 0) {

                    // User already in the list

                    res.send({
                      result: 'failed',
                      msg: 'You are already blocking this person',
                      err: '',
                      json: results[0],
                      length: results.length
                    });
                    connection.release();

                  } else if(blockedId === post.userId) {

                    res.send({
                      result: 'failed',
                      msg: 'Try as you might, you cannot ignore yourself!',
                      err: '',
                      json: results[0],
                      length: results.length
                    });
                    connection.release();

                  } else {

                   // user not in list, lets add it
                    sql = 'INSERT INTO blocking (user_id, blocking_user_id) VALUES ?';

                    insert = [
                      [blockedId, post.userId]
                    ];

                    connection.query(sql, [insert], function (err, results) {
                     // ignore the loser
                      res.send({
                        result: 'success',
                        msg: 'was added to your blocked list.',
                        err: '',
                        json: results[0],
                        length: results.length
                      });
                      connection.release();

                    });

                  }
                });
              } else  {
               // User does not exist
                res.send({
                  result: 'error',
                  msg: 'does not exist',
                  err: '',
                  json: results[0],
                  length: results.length
                });
                connection.release();
              }

            } // end err if/else
          }); // end connection.query

        } // end err if/else


      }); // end db.getConnection

    };


  /**
   * Get all from users blocked list
   */
  exports.listBlocked = function (req, res) {

    var user = req.user[0];
    console.log(user.id);

    db.getConnection(function (err, connection) {
      console.log('get connection');
      if (err) {
        console.error('Connection Error: ' + err);
        res.statusCode = 503;
        res.send({
          result: 'error',
          err   : err.code
        });

      } else {
        console.log('connection success, sending query');
        connection.query('SELECT username, user_id'+
          ' FROM blocking INNER JOIN users'+
          ' ON blocking.user_id = users.id'+
          ' WHERE blocking_user_id = ?', parseInt(user.id), function (err, rows) {
            console.log('query returning');
            if (err) {

              console.error(err);
              res.statusCode = 500;
              res.send({
                result: 'error',
                err: err.code
              });
              connection.release();

            } else {
              console.log('not an error');
              if (rows.length === 0) {
                console.log('nothing to list');
                res.statusCode = 204;
                connection.release();

              } else {
                console.log('all good');
                res.send(rows);
                connection.release();

              }
            }
          }); // end connection.query
      }
    }); // end db.getConnection
  };


})();
