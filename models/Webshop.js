const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Webshop = sequelize.define(
  "Webshop", // Naziv modela
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    port: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    paymentOptions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
  },
  {
    tableName: "Webshops",
    timestamps: false,
  }
);

module.exports = Webshop;
