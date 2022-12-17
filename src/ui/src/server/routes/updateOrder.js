const express = require("express");
const orderModel = require("../models/Order");
const app = express();

app.post("/updateOrder", async (req, res) => {
  try {
    console.log(req.body);
    const filter = { orderID: req.body.orderID };
    const update = { $set: { status: req.body.status } };
    const order = await orderModel.update(filter, update);
    res.json(order);
  } catch (error) {
    res.sendStatus(500);
  }
});

module.exports = app;
