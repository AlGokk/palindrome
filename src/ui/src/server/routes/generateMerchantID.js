const express = require("express");

const app = express();

app.post("/generateMerchantID", async (req, res) => {
  try {
    const n = Math.floor(Math.random() * 1000000000);
    merchantModel.findOne(
      { _merchant: req.body.merchant },
      async (err, result) => {
        if (!result) {
          console.log(`Saving new merchantID: ${n}`);

          res.send({});
        } else {
          console.log(`merchantID exists: ${req.body.merchant}`);
          res.send(result);
        }
      }
    );
  } catch (error) {
    res.sendStatus(500).error(error);
  }
});

module.exports = app;
