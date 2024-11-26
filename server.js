const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sequelize = require("./models/index");
const Webshop = require("./models/Webshop");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
const swaggerDocument = require(path.join(__dirname, "swagger.json"));

const app = express();
const PORT = 8080;

app.use(cors());
app.use(bodyParser.json());

sequelize.sync({ force: false }).then(() => {
  console.log("Database synced!");
});

// Routes
app.get("/", (req, res) => res.send("PSP is running on port 8080"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post("/api/webshops", async (req, res) => {
  try {
    const { name, webshopId, paymentMethods } = req.body;

    if (!name || !webshopId || !paymentMethods) {
      return res
        .status(400)
        .json({ error: "Name, webshopId, and paymentMethods are required" });
    }

    // Provera da li webshop već postoji
    const existingWebshop = await Webshop.findOne({ where: { webshopId } });
    if (existingWebshop) {
      return res
        .status(409)
        .json({ error: "Webshop with this ID already exists" });
    }

    const webshop = await Webshop.create({
      name,
      webshopId,
      paymentOptions: paymentMethods,
    });

    res.status(201).json(webshop);
  } catch (error) {
    console.error("Error registering webshop:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/webshops/:webshopId/payment-methods", async (req, res) => {
  try {
    const { webshopId } = req.params;

    const webshop = await Webshop.findOne({ where: { webshopId } });
    if (!webshop) {
      return res.status(404).json({ error: "Webshop not found" });
    }

    res.json({ paymentMethods: webshop.paymentOptions });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/payments", async (req, res) => {
  const { webshopId, method, amount, metadata } = req.body;

  if (!webshopId || !method || !amount) {
    return res
      .status(400)
      .json({ error: "webshopId, method, and amount are required" });
  }

  try {
    const webshop = await Webshop.findOne({ where: { webshopId } });

    if (!webshop) {
      return res.status(404).json({ error: "Webshop not found" });
    }

    const paymentMethod = PaymentRegistry.getMethod(method);

    if (!paymentMethod) {
      return res
        .status(404)
        .json({ error: `Payment method '${method}' not found` });
    }

    const result = paymentMethod.processPayment(amount, metadata);

    res.json({
      message: "Payment processed successfully",
      result,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PaymentRegistry = require("./paymentMethods/PaymentRegistry");

app.post("/api/psp/process-payment", (req, res) => {
  const { method, amount, metadata, webshopId } = req.body;

  if (!method || !amount || !webshopId) {
    return res
      .status(400)
      .json({ error: "Method, amount and webshopId are required" });
  }

  const paymentMethod = PaymentRegistry.getMethod(method);

  if (!paymentMethod) {
    return res
      .status(404)
      .json({ error: `Payment method '${method}' not found` });
  }

  try {
    const result = paymentMethod.processPayment(amount, metadata);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/psp/add-method", (req, res) => {
  const { name, classPath } = req.body;

  if (!name || !classPath) {
    return res.status(400).json({ error: "Name and classPath are required" });
  }

  try {
    const MethodClass = require(classPath);
    PaymentRegistry.addMethod(name, new MethodClass());
    res.json({ message: `Payment method '${name}' added successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register webshop
app.post("/api/webshop/register", async (req, res) => {
  const { name, webshopId, paymentOptions } = req.body;

  if (!name || !webshopId || !paymentOptions) {
    return res
      .status(400)
      .json({ error: "Name, webshopId, and paymentOptions are required" });
  }

  try {
    const newWebshop = await Webshop.create({
      name,
      port: webshopId,
      paymentOptions,
    });

    res.status(201).json(newWebshop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/psp/payment-options", async (req, res) => {
  const { webshopId, totalPrice } = req.body;

  if (!webshopId) {
    return res.status(400).json({ error: "webshopId (port) is required" });
  }

  try {
    const webshop = await Webshop.findOne({ where: { port: webshopId } });

    if (!webshop) {
      return res.status(404).json({ error: "Webshop not found" });
    }

    console.log("Total Price:", totalPrice);

    res.json({ paymentMethods: webshop.paymentOptions });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
app.listen(PORT, () => {
  console.log(`PSP running on port ${PORT}`);
  console.log(
    `Swagger documentation available at http://localhost:${PORT}/api-docs`
  );
});
