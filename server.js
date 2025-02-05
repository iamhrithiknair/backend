const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Basic route for the root URL
app.get('/', (req, res) => {
    res.send('Welcome to ShoeStore API');
});

let orders = [];

app.post('/place-order', (req, res) => {
    const order = req.body;
    orders.push(order);
    console.log("New Order Received:", order);
    res.json({ message: "Order placed successfully!", order });
});

app.get('/orders', (req, res) => {
    res.json(orders);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));