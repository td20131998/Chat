const config = require('../../config/configuration');
const sql = require('mssql');

module.exports = {
    connect: function(callback) {
        sql.connect(config.sql, err => {
            if (err) {
                console.log(err);
            } else {
                callback();
            }
        })
    },
    query: function(sqlQuery, callback) {
        new sql.Request().query(sqlQuery, (err, result) => {
            if (err) {
                console.log(err);
                callback(err);
            } else {
                callback(result);
            }
        })
    },
    close: function(callback) {
        sql.close();
        callback();
    }
}

