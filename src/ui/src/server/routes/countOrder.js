const express = require("express");
const orderModel = require("../models/Order");
const app = express();

app.post("/countOrder", async (req, res) => {
  const orders = await orderModel.countDocuments({}).exec();
  try {
    res.json(orders);
  } catch (error) {
    res.sendStatus(500);
  }
});

module.exports = app;
