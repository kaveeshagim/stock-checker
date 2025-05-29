const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  test("Viewing one stock", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: "GOOG" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body.stockData, "stock");
        assert.property(res.body.stockData, "price");
        assert.property(res.body.stockData, "likes");
        done();
      });
  });

  test("Viewing one stock and liking it", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: "GOOG", like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body.stockData, "stock");
        assert.property(res.body.stockData, "price");
        assert.property(res.body.stockData, "likes");
        assert.isAbove(res.body.stockData.likes, 0);
        done();
      });
  });

  test("Viewing the same stock and liking it again", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: "GOOG", like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body.stockData, "stock");
        assert.property(res.body.stockData, "price");
        assert.property(res.body.stockData, "likes");
        assert.isAbove(res.body.stockData.likes, 0);
        done();
      });
  });

  test("Viewing two stocks", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: ["GOOG", "MSFT"] })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        res.body.stockData.forEach((stock) => {
          assert.property(stock, "stock");
          assert.property(stock, "price");
          assert.property(stock, "likes");
        });
        done();
      });
  });

  test("Viewing two stocks and liking one of them", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: ["GOOG", "MSFT"], like: "GOOG" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        res.body.stockData.forEach((stock) => {
          assert.property(stock, "stock");
          assert.property(stock, "price");
          assert.property(stock, "likes");
        });
        // Check that GOOG has more likes than MSFT
        const googStock = res.body.stockData.find((s) => s.stock === "GOOG");
        const msftStock = res.body.stockData.find((s) => s.stock === "MSFT");
        assert.isAbove(googStock.likes, msftStock.likes);
        done();
      });
  });

  test("Viewing two stocks and liking both of them", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: ["GOOG", "MSFT"], like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        res.body.stockData.forEach((stock) => {
          assert.property(stock, "stock");
          assert.property(stock, "price");
          assert.property(stock, "likes");
          assert.isAbove(stock.likes, 0);
        });
        done();
      });
  });

  test("Viewing an invalid stock returns error", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: "INVALIDSTOCK" })
      .end(function (err, res) {
        assert.equal(res.status, 500); // or 400, depending on how your server handles this
        assert.property(res.body, "error");
        done();
      });
  });
});
