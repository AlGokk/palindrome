const express = require("express");
const orderModel = require("../models/Order");
const app = express();

app.post("/getOrders", async (req, res) => {
  const orders = await orderModel
    .find({
      $or: [{ seller: req.body.account }, { customer: req.body.account }],
    })
    .exec();
  try {
    res.json(orders);
  } catch (error) {
    res.sendStatus(500).error(error);
  }
});

module.exports = app;
