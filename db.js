const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'mysql://root:zTOFACqJnxvJTxnoNgVbWdHcRJuFtsPg@metro.proxy.rlwy.net:31319/railway',
    user: 'root',
    password: 'zTOFACqJnxvJTxnoNgVbWdHcRJuFtsPg',
    database: 'railway',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = pool;
