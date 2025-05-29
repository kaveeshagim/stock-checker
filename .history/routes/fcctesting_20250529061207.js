"use strict";

var cors = require("cors");
var fs = require("fs");
var runner = require("../test-runner");

module.exports = function (app) {
  app.route("/_api/server.js").get(function (req, res, next) {
    console.log("[GET] /_api/server.js");
    fs.readFile(__dirname + "/server.js", function (err, data) {
      if (err) return next(err);
      console.log("✓ Read server.js");
      res.send(data.toString());
    });
  });

  app.route("/_api/routes/api.js").get(function (req, res, next) {
    console.log("[GET] /_api/routes/api.js");
    fs.readFile(__dirname + "/routes/api.js", function (err, data) {
      if (err) return next(err);
      console.log("✓ Read api.js");
      res.type("txt").send(data.toString());
    });
  });

  app
    .route("/_api/controllers/convertHandler.js")
    .get(function (req, res, next) {
      console.log("[GET] /_api/controllers/convertHandler.js");
      fs.readFile(
        __dirname + "/controllers/convertHandler.js",
        function (err, data) {
          if (err) return next(err);
          console.log("✓ Read convertHandler.js");
          res.type("txt").send(data.toString());
        }
      );
    });

  app.get(
    "/_api/get-tests",
    cors(),
    function (req, res, next) {
      console.log("[GET] /_api/get-tests - NODE_ENV:", process.env.NODE_ENV);
      if (process.env.NODE_ENV === "test") return next();
      res.json({ status: "unavailable" });
    },
    function (req, res, next) {
      console.log("→ Getting test report from runner...");
      if (!runner.report) {
        console.log("⚠️ No report found yet.");
        return next();
      }
      const filtered = testFilter(runner.report, req.query.type, req.query.n);
      console.log("✓ Filtered tests:", filtered.length);
      res.json(filtered);
    },
    function (req, res) {
      runner.on("done", function (report) {
        console.log("✓ Runner finished tests.");
        process.nextTick(() => {
          const filtered = testFilter(report, req.query.type, req.query.n);
          console.log("✓ Final filtered test report:", filtered.length);
          res.json(filtered);
        });
      });
    }
  );

  app.get("/_api/app-info", function (req, res) {
    console.log("[GET] /_api/app-info");
    var hs = Object.keys(res._headers).filter(
      (h) => !h.match(/^access-control-\w+/)
    );
    var hObj = {};
    hs.forEach((h) => {
      hObj[h] = res._headers[h];
    });
    delete res._headers["strict-transport-security"];
    console.log("✓ App info sent.");
    res.json({ headers: hObj });
  });
};

function testFilter(tests, type, n) {
  console.log("→ Filtering tests with type:", type, "and index:", n);
  var out;
  switch (type) {
    case "unit":
      out = tests.filter((t) => t.context.match("Unit Tests"));
      break;
    case "functional":
      out = tests.filter(
        (t) => t.context.match("Functional Tests") && !t.title.match("#example")
      );
      break;
    default:
      out = tests;
  }
  if (n !== undefined) {
    console.log(
      `✓ Returning test at index ${n}:`,
      out[n] ? out[n].title : "Not found"
    );
    return out[n] || out;
  }
  console.log("✓ Returning all filtered tests:", out.length);
  return out;
}
