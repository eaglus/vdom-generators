const express = require("express");
const app = express();
const Bundler = require("parcel-bundler");

const http = require("http");
const fs = require("fs");
const path = require("path");

const { getRange } = require("./utils.js");

app.get("/api", (request, response) => {
  const queryRe = /\?dateFrom=(-?\d+)&dateTo=(-?\d+)&collection=(\w+)/;
  const match = request.url.match(queryRe);
  if (match) {
    const from = parseInt(match[1], 10);
    const to = parseInt(match[2], 10);
    const collection = match[3];

    response.writeHead(200, {
      "Content-Type": "application/json;charset=utf-8"
    });
    const data = getRange(from, to, collection);
    response.end(JSON.stringify(data), "utf-8");
  } else {
    response.writeHead(404);
    response.end(`Error 404. Wrong api call: ${request.url}`, "utf-8");
  }
  return;
});

const file = "index.html";
const options = {};
const bundler = new Bundler(file, options);
app.use(bundler.middleware());

app.listen(5000, () => console.log("Listening on port 5000!"));
