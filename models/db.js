const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("myschool_db", "root", "123456", {
  host: "localhost",
  port:"3306",
  dialect: "mysql",
});

module.exports = sequelize;
