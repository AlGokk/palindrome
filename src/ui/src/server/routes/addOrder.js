const express = require("express");
const orderModel = require("../models/Order");
const app = express();

app.post("/addOrder", async (req, res) => {
  console.log(req.body);
  try {
    const order = new orderModel(req.body);
    await order.save();
    res.json(order);
  } catch (error) {
    res.sendStatus(500);
  }
});

module.exports = app;
