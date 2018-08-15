(function () {

'use strict';

// Database Connection
var db     = require('./../config/mysql');
var bcrypt = require('bcrypt');


exports.register = function (req, res) {

    /**
     * TODO:
     * - Return response to users browser if username or email is taken.
     *   at the moment, the website simply doesn't respond.
     * - Email verification.
     */

    db.getConnection(function (err, connection ) {

        var post = req.body;

        if (!err) {

          var query = 'SELECT 1 FROM users WHERE username = ?';

          connection.beginTransaction(function(err){
            if (err) {throw err;}

            connection.query(query, [post.username], function(err, results) {
              if (err) {
                connection.release();
                return res.json(500, {error: 'Failure'});
              }

              // check if username exists.
              if (results.length > 0) {
                // user already exists.
                connection.release();
                return res.json(409, {message: 'Username is already in use.'});
              }

              // username is available, now check for email
              query = 'SELECT 1 FROM users WHERE email = ?';
              connection.query(query, [post.email], function (err, results) {

                if (err) {
                  connection.release();
                  return res.json(500, {error: 'Email Failure'});
                }

                // email was found, must choose different email
                if (results.length > 0) {
                  res.statusCode = 409;
                  connection.release();
                  return res.send({
                    status: 'failed',
                    message: 'Email is already in use.',
                    err: err.code,
                    results: results,
                    length: results.length
                  });
                }

                // email is available, lets hash the password and enter into db.
                var password = connection.escape(post.password);
                bcrypt.hash(password, 8, function (err, hash) {
                  if (err) {console.log(err);}

                  // query for entering user info into db.
                  query = 'INSERT INTO users ('+
                  'first_name,'+
                  'last_name,'+
                  'zip, email,'+
                  'yob, '+
                  'gender,'+
                  'username,'+
                  'password'+
                  ') VALUES ?';

                  // users data to be inserted.
                  var inserts = [
                    [
                      post.fName,
                      post.lName,
                      post.zipCode,
                      post.email,
                      post.yob,
                      post.gender,
                      post.username,
                      hash
                    ]
                  ];

                  // running the user insert query.
                  connection.query(query, [inserts], function (err, results) {

                    // Error entering user into db.
                    if (err) {
                      connection.release();
                      return res.json(500, {error: 'User Insert Err: '+err});
                    }

                    // user insert a success. now enter link to the users selected sports.
                    query = 'INSERT INTO user_sports_link ('+
                    'sport_id,'+
                    'user_id'+
                    ') VALUES ?';

                    // run a for loop to insert user selected sports_id's into
                    // an array with the just inserted user ID.
                    var insert = [];
                    var userId = results.insertId;
                    for (var i = 0; i < post.sports.length; i++) {
                      insert.push([post.sports[i], userId]);
                    }

                    // running the user_sports_link insert query.
                    connection.query(query, [insert], function (err, results) {

                      // error entering sports_link into db.
                      if (err) {
                        connection.release();
                        return res.json(500, {
                          error: 'link insert failed: ' + err
                        });
                      }

                      // All good, lets commit the changes to db.
                      connection.commit(function (err) {
                        if (err) {connection.rollback(function(){throw err;});}

                        res.send ({
                          result: 'success',
                          msg: 'your account has been created.',
                          err: '',
                          json: results,
                          length: results.length
                        });
                        connection.release();
                      });
                    }); // End sports_link insert query.

                  }); // End insert new user insert query.


                }); // End hash and Insert into DB.
              }); // End email search query.
            }); // End username search query.
          }); // End connection.beginTransaction.
          connection.release();
        } else { // End if !err
          throw err;
        }
      });
  }; // End user registration.

exports.update = function (req, res) {
  /**
   * Update user information
   */


  // var post = {
  //   'id': req.body.id,
  //   'password': req.body.password,
  //   'email': req.body.email,
  //   'cpass': req.body.cpass
  // };
  var post = req.body;


  db.getConnection(function (err, connection ) {
    if (err) {
      res.write({
        error: err.code
      });
    } else {
      // check if current password is legit

      connection.query('SELECT password FROM users WHERE id = ? LIMIT 1',
       [post.id], function (err, user) {

        if (err) {
          return res.send({
            error: err.code
          });

        } else {

          var hash = user[0].password;
          var password = connection.escape(post.cpass);

          bcrypt.compare(password, hash, function (err, match) {
            if (!match) {

              res.send({
                  result: 'error',
                  msg: 'You have provide the wrong password for this account.',
                  err: 'wrong password'
                });
              connection.release();

            } else {

              var msg = 'Your ';
              var sql = 'UPDATE users SET ';


              // if changing password
              if (post.password) {
                msg += 'password ';
                var password = connection.escape(post.password);
                var hash = bcrypt.hashSync(password, 8);
                sql += 'password = "'+hash+'"';
              }


              // if changing email
              if (post.email) {
                if (post.password) { sql += ', '; msg += 'and ';}
                var email = connection.escape(post.email);
                sql += 'email = ' + email;
                msg += 'email ';
              }


              sql += ' WHERE id = '+connection.escape(post.id);

              connection.query(sql, function (err, results){
                if (err) {
                  console.error(err);
                  // res.statusCode = 500;
                  res.send({
                    result: 'error',
                    err: err.code
                  });
                } else {

                  msg += 'has been updated.';
                  res.send({
                    result: 'success',
                    msg: msg,
                    err: '',
                    json: results[0],
                    length: results.length
                  });
                  connection.release();
                }

              }); // end connection.query

            }

          }); // end bcrypt

        } // end else

      }); // end connection.query

    } // end else


  });

};


exports.mySettings = function (req, res) {
  var user = req.user[0];

  db.getConnection(function (err, connection) {

    if (err) {
      // release connection, return error string
      connection.release();
      res.write(err.toString());
    } else {

      // get list of currently blocked usernames
      var sql = 'SELECT users.username, blocking.user_id FROM users INNER JOIN blocking ON blocking.user_id = users.id WHERE blocking_user_id = ?';

      connection.query(sql, [parseInt(user.id)], function(err, rows) {
        if (err) {
          // release connection, send error
          connection.release();
          console.error(err);
          res.statusCode = 500;
          res.send({
            result: 'error',
            err: err.code
          });

        } else {
          // release connection, send
          // user settings info back
          // to user.
          connection.release();
          res.send(rows);

        }
      });

    }

  });
};

/**
 * Remove Users from blocked list
 */
exports.removeBlocked = function (req, res) {
  var post = req.body;
  var user = req.user[0];

  db.getConnection(function (err, connection) {
    // err, return err
    if (err) { return res.write(err.toString()); }

    var blockedUser = connection.escape(post.blockedUser);
    var userId = connection.escape(parseInt(user.id));

    var sql = 'DELETE FROM blocking WHERE user_id = '+
      blockedUser+
      ' AND blocking_user_id = '+
      userId+
      ' and timestamp + INTERVAL 5 MINUTE < NOW() ';

    connection.query(sql, function (err, results) {

      if (err) {

        connection.release();
        console.error(err);
        res.statusCode = 500;
        res.send({
          result: 'error',
          err: err.code
        });

      } else {

        // User successfully removed
        if(results.affectedRows > 0 ){
          // user was removed
          connection.release();
          res.send({
            result: 'success',
            msg: 'has been removed',
            err: '',
            json: results[0],
            length: results.length
          });

        } else {
          // User was not removed
          // probably too recent
          // of an input.
          connection.release();
          res.send({
            result: 'failed',
            msg: 'was recenly added, wait 5 minutes and try again',
            err: '',
            json: results[0],
            length: results.length
          });
        }
      } // end err if/else
    }); // end connection.query
  });
};

/**
 * Add uses to your blocked list
 */
exports.addBlocked = function (req, res) {

    var post = {
      'userId'    : req.body.userId,
      'blockUser' : req.body.blockUser
    };
    var user = req.user[0];


    db.getConnection(function (err, connection) {

      if (err) {
        connection.release();
        res.write(err.toString());
      } else {

        // Get the id for the user to be blocked
        var sql = 'SELECT id FROM users WHERE username = ? LIMIT 1';

        var insert = [
          [post.blockUser]
        ];

        connection.query(sql, [insert], function (err, results) {

          if (err) {
            connection.release();
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
                if (err) {
                  connection.release();
                  throw err;
                }

                if (results.length > 0) {
                  // User already in the list
                  connection.release();
                  res.send({
                    result: 'failed',
                    msg: 'You are already blocking this person',
                    err: '',
                    json: results[0],
                    length: results.length
                  });

                } else if(blockedId === post.userId) {
                  connection.release();
                  res.send({
                    result: 'failed',
                    msg: 'Try as you might, you cannot ignore yourself!',
                    err: '',
                    json: results[0],
                    length: results.length
                  });

                } else {
                 // user not in list, lets add it
                  sql = 'INSERT INTO blocking (user_id, blocking_user_id) VALUES ?';

                  insert = [
                    [blockedId, post.userId]
                  ];

                  connection.query(sql, [insert], function (err, results) {
                   // ignore the loser
                    connection.release();
                    res.send({
                      result: 'success',
                      msg: 'was added to your blocked list.',
                      err: '',
                      json: results[0],
                      length: results.length
                    });
                  });
                }
              });
            } else  {
             // User does not exist
              connection.release();
              res.send({
                result: 'error',
                msg: 'does not exist',
                err: '',
                json: results[0],
                length: results.length
              });
            }

          } // end err if/else
        }); // end connection.query

      } // end err if/else


    }); // end db.getConnection

  };


exports.listBlocked = function (req, res) {
  var user = req.user[0];

  db.getConnection(function (err, connection) {

    if (err) {
      console.error('Connection Error: ' + err);
      res.statusCode = 503;
      res.send({
        result: 'error',
        err   : err.code
      });

    } else {

      connection.query('SELECT username, user_id'+
        ' FROM blocking INNER JOIN users'+
        ' ON blocking.user_id = users.id'+
        ' WHERE blocking_user_id = ?', parseInt(user.id), function (err, rows) {

          if (err) {
            connection.release();
            console.error(err);
            res.statusCode = 500;
            res.send({
              result: 'error',
              err: err.code
            });

          } else {

            if (rows.length === 0) {
              connection.release();
              res.statusCode = 204;

            } else {
              connection.release();
              res.send(rows);

            }
          }
        }); // end connection.query
    }

  }); // end db.getConnection
};

exports.messages = function (req, res) {
  var user = req.user[0];

  db.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      console.error('Connection Error: ' + err);
      res.statusCode = 503;
      res.send({
        result: 'error',
        err: err.code
      });

    } else {
      connection.query('SELECT COUNT(*) FROM messages WHERE recipient_id = ? and isRead = false', parseInt(user.id), function (err, rows) {

        if (err) {
          connection.release();
          console.error(err);
          res.statusCode = 500;
          res.send({
            result: 'error',
            err: err.code
          });


        } else {
          if (rows.length === 0) {
            connection.release();
            res.statusCode = 204;

          } else {
            connection.release();
            res.send({
              result: 'success',
              err: '',
              count: rows[0]['COUNT(*)'],
              json: rows[0],
              length: 1
            });


          } // end if rows.length /else
        }
      }); // end query
    } // end if err

  }); // end db.connect
}; // end export

exports.posts = function (req, res) {
  var user = req.user[0];

  db.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      throw err;

    } else {
      var sql = 'SELECT sports.sport, posts.status FROM posts INNER JOIN sports ON posts.sport_id = sports.id WHERE user_id = ? LIMIT 10';
      connection.query(sql, parseInt(user.id), function (err, rows) {
        if (err) {
          connection.release();
          throw err;
        } else {
          connection.release();
          res.send(rows);
        }
      });
    }
  });
};


})();
