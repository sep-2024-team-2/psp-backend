const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("psp", "postgres", "super", {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

sequelize
  .authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Error: " + err));

module.exports = sequelize;
