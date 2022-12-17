const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  paymentSystemUID: {
    type: String,
    required: true,
  },
  orderBookUID: {
    type: String,
    required: true,
  },
  orderID: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  selectedToken: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  maturityTime: {
    type: Number,
    required: true,
  },
});

const Order = mongoose.model("order", OrderSchema);

module.exports = Order;
