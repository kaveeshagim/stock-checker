"use strict";
const axios = require("axios");
const STOCK_API =
  "https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock";

module.exports = function (app) {
  app.route("/api/stock-prices").get(function (req, res) {
    const response = axios.get(`${STOCK_API}/${req.query.stock}/quote`);
    return {
      stock: response.data.symbol,
      price: response.data.latestPrice,
    };
  });
};
