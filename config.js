const config = {
     port: process.env.PORT || 3000,
     mysqlPort: process.env.MYSQL_ADDON_PORT,
     mysqlHost: process.env.MYSQL_ADDON_HOST,
     mysqlUser: process.env.MYSQL_ADDON_USER, 
     mysqlPassword: process.env.MYSQL_ADDON_PASSWORD, 
     mysqlDatabase: process.env.MYSQL_ADDON_DB,
     mysqlURI : process.env.MYSQL_ADDON_URI,
}

module.exports = config;