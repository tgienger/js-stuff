'use strict';

var mysql = require('mysql');
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '6KfeP8Sn',
    database: '28sports_exp'
});

exports.getConnection = function (callback) {
    pool.getConnection(function(err, connection ) {
        callback(err, connection);
    });
};


// var config = {
//   host: 'localhost',
//   user: 'root',
//   password: '6KfeP8Sn',
//   database: '28sports_exp'
// };

// var connection = mysql.createConnection(config);

// connection.connect(function(err) {
//     if(err) {
//         console.log('Could not connect to DB: ', err);
//     } else {
//         console.log('Connected to ' + config.database + ' on ' + config.host );
//     }
// });

// connection.on('close', function (err) {
//     if (err) {
//         // Oops! We've lost connection
//         connection = mysql.createConnection(config);
//     } else {
//         console.log('Connection closed normally.');
//     }
// });

// module.exports = connection;
