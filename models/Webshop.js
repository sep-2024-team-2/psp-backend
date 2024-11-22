const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Webshop = sequelize.define(
  "Webshop",
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
      type: DataTypes.ARRAY(DataTypes.STRING), // Opcije: ["card", "paypal", "crypto", "bank_transfer"]
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Webshop;
