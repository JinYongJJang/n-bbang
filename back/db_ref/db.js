const mysql = require("mysql");
const dbConfig = require('./dbconfig.json');

let pool = mysql.createPool(dbConfig);

function getConnection(callback) {
    pool.getConnection((err, conn) => {
        if (!err) {
            callback(conn);
        } else {
            console.log(err);
        }
    });
}

module.exports = getConnection;