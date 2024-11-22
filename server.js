const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sequelize = require("./models/index");
const Webshop = require("./models/Webshop");

const app = express();
const PORT = 8080;

app.use(cors());
app.use(bodyParser.json());

sequelize.sync({ force: false }).then(() => {
  console.log("Database synced!");
});

// Routes
app.get("/", (req, res) => res.send("PSP is running on port 8080"));

app.post("/api/psp/payment-options", async (req, res) => {
  try {
    const { totalPrice, port } = req.body;
    console.log("Received data:", { totalPrice, port });

    if (!totalPrice || !port) {
      return res
        .status(400)
        .json({ message: "Missing required fields: totalPrice or port" });
    }

    const webshop = await Webshop.findOne({ where: { port } });

    if (!webshop) {
      return res
        .status(404)
        .json({ message: "Webshop not found for this port" });
    }

    res.json({ paymentOptions: webshop.paymentOptions });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/webshops", async (req, res) => {
  try {
    const { name, port, paymentOptions } = req.body;
    const webshop = await Webshop.create({ name, port, paymentOptions });
    res.status(201).json(webshop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/webshops/:port", async (req, res) => {
  try {
    const { port } = req.params;
    const webshop = await Webshop.findOne({ where: { port } });

    if (!webshop) {
      return res.status(404).json({ message: "Webshop not found" });
    }

    res.json({ paymentOptions: webshop.paymentOptions });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`PSP running on port ${PORT}`));
