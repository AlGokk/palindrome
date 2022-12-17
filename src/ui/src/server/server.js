const express = require("express");
const mongoose = require("mongoose");
const generateMerchantID = require("./routes/generateMerchantID");
const AddOrderRoute = require("./routes/addOrder");
const CountOrderRoute = require("./routes/countOrder");
const GetOrderRoute = require("./routes/getOrders");
const UpdateOrderRoute = require("./routes/updateOrder");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.use(express.json());

const uri = `mongodb+srv://maximus:${process.env.MongoPWD}@cluster0.ozdxj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(CountOrderRoute);
app.use(AddOrderRoute);
app.use(UpdateOrderRoute);
app.use(GetOrderRoute);

app.listen(3001, () => {
  console.log("Server is running...");
});
