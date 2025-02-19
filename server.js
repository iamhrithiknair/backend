const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const jsforce = require("jsforce");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Salesforce OAuth Connection
const conn = new jsforce.Connection({
  oauth2: {
    loginUrl: process.env.SF_LOGIN_URL,
    clientId: process.env.SF_CLIENT_ID,
    clientSecret: process.env.SF_CLIENT_SECRET,
  },
});

// Login to Salesforce
conn.login(process.env.SF_USERNAME, process.env.SF_PASSWORD, (err, userInfo) => {
  if (err) {
    console.error("Salesforce Login Error:", err);
    return;
  }
  console.log("Connected to Salesforce:", userInfo.id);
});

// Basic API Route
app.get("/", (req, res) => {
  res.send("Welcome to ShoeStore API");
});

// Handle Order Placement & Send Data to Salesforce
app.post("/place-order", async (req, res) => {
  const { name, email, mobile, product, quantity, price } = req.body;

  if (!name || !email || !mobile || !product || !quantity || !price) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    // Insert Order into Salesforce
    const result = await conn.sobject("Order__c").create({
      Name__c: name,
      Email__c: email,
      Mobile__c: mobile,
      Product__c: product,
      Quantity__c: quantity,
      Price__c: price,
    });

    console.log("Order saved to Salesforce:", result);

    res.json({
      message: "Order placed successfully & saved in Salesforce!",
      salesforceId: result.id,
    });
  } catch (error) {
    console.error("Salesforce Error:", error);
    res.status(500).json({ message: "Failed to save order to Salesforce", error });
  }
});

// Retrieve Orders from Salesforce
app.get("/orders", async (req, res) => {
  try {
    const orders = await conn.sobject("Order__c").find({});
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to retrieve orders from Salesforce" });
  }
});

// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

