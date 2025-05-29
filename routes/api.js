"use strict";
const express = require("express");
const router = express.Router();
const { getStockPrices } = require("../controllers/stockController");

module.exports = function (app) {
  router.get("/stock-prices", getStockPrices);
  app.use("/api", router);
};
