const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jsforce = require("jsforce");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Salesforce OAuth Connection
const conn = new jsforce.Connection({
    loginUrl: process.env.SF_LOGIN_URL,
});

// Login to Salesforce
conn.login(
    process.env.SF_USERNAME,
    process.env.SF_PASSWORD + process.env.SF_SECURITY_TOKEN,
    (err, userInfo) => {
        if (err) {
            console.error("❌ Salesforce Login Error:", err);
            return;
        }
        console.log("✅ Connected to Salesforce! User ID:", userInfo.id);
    }
);

// Basic API Route
app.get("/", (req, res) => {
    res.send("Welcome to ShoeStore API");
});

// Handle Order Placement & Send Data to Salesforce
app.post("/place-order", async (req, res) => {
    const { name, email, mobile, items, total } = req.body;

    if (!name || !email || !mobile || !items || !total) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        for (const item of items) {
            const result = await conn.sobject("Order__c").create({
                Name__c: name,
                Email__c: email,
                Mobile__c: mobile,
                Product__c: item.product,
                Quantity__c: item.quantity,
                Price__c: item.price,
                Total__c: total,
            });

            console.log("✅ Order saved to Salesforce:", result);
        }

        res.json({
            message: "Order placed successfully & saved in Salesforce!",
        });
    } catch (error) {
        console.error("❌ Salesforce Error:", error);
        res.status(500).json({ message: "Failed to save order to Salesforce", error });
    }
});

// Retrieve Orders from Salesforce
app.get("/orders", async (req, res) => {
    try {
        const orders = await conn.sobject("Order__c").find({});
        res.json(orders);
    } catch (error) {
        console.error("❌ Error fetching orders:", error);
        res.status(500).json({ message: "Failed to retrieve orders from Salesforce" });
    }
});

// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
