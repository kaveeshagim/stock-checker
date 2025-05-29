"use strict";
const axios = require("axios");
const crypto = require("crypto");
const Stock = require("../models/Stock.js");
const STOCK_API =
  "https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock";

module.exports = function (app) {
  app.route("/api/stock-prices").get(async function (req, res) {
    try {
      console.log("Received request for stock prices:", req.query);
      const stocks = req.query.stock; // Could be a string or array
      const like = req.query.like === "true";
      const anonymizedIP = crypto
        .createHash("md5")
        .update(req.ip)
        .digest("hex");

      // Handle single stock case
      if (!Array.isArray(stocks)) {
        const stockInfo = await getStockData(stocks, like, anonymizedIP);
        return res.json({ stockData: stockInfo });
      }

      // Handle two stocks case
      const [stock1, stock2] = stocks;

      const data1 = await getStockData(stock1, like, anonymizedIP);
      const data2 = await getStockData(stock2, like, anonymizedIP);

      const relLikes1 = data1.likes - data2.likes;
      const relLikes2 = data2.likes - data1.likes;

      res.json({
        stockData: [
          { stock: data1.stock, price: data1.price, rel_likes: relLikes1 },
          { stock: data2.stock, price: data2.price, rel_likes: relLikes2 },
        ],
      });
    } catch (error) {
      console.error("Error fetching stock data:", error.message);
      res.status(500).json({ error: "Unable to fetch stock data" });
    }
  });

  // Helper function
  async function getStockData(symbol, like, ipHash) {
    const upperSymbol = symbol.toUpperCase();
    const response = await axios.get(`${STOCK_API}/${upperSymbol}/quote`);
    const { symbol: stockSymbol, latestPrice: price } = response.data;

    let stock = await Stock.findOne({ symbol: stockSymbol });
    if (!stock) {
      stock = new Stock({ symbol: stockSymbol, likes: 0, ipHashes: [] });
    }

    if (like && !stock.ipHashes.includes(ipHash)) {
      stock.likes++;
      stock.ipHashes.push(ipHash);
      await stock.save();
    }

    return {
      stock: stockSymbol,
      price,
      likes: stock.likes,
    };
  }
};
