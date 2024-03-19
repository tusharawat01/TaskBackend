const config = {
     port: process.env.PORT || 3000,
     mysqlPort: process.env.MYSQL_PORT,
     mysqlHost: process.env.MYSQL_HOST,
     mysqlUser: process.env.MYSQL_USER, 
     mysqlPassword: process.env.MYSQL_PASSWORD, 
     mysqlDatabase: process.env.MYSQL_DATABASE,
}

module.exports = config;