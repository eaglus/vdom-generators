const { URL } = require("url");
const http = require("http");
const fs = require("fs");
const path = require("path");

const { getRange } = require("./utils.js");

http
  .createServer(function(request, response) {
    if (request.url.startsWith("/api?")) {
      const queryRe = /\?dateFrom=(-?\d+)&dateTo=(-?\d+)&collection=(\w+)/;
      const match = request.url.match(queryRe);

      const from = parseInt(match[1], 10);
      const to = parseInt(match[2], 10);
      const collection = match[3];

      response.writeHead(200, { "Content-Type": "application/json" });
      const data = getRange(from, to, collection);
      response.end(JSON.stringify(data), "utf-8");
      return;
    }

    let filePath = "." + request.url;
    if (filePath == "./") {
      filePath = "./index.html";
    }

    const extname = path.extname(filePath);
    let contentType = "text/html";
    switch (extname) {
      case ".js":
        contentType = "text/javascript";
        break;
      case ".css":
        contentType = "text/css";
        break;
      case ".json":
        contentType = "application/json";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".jpg":
        contentType = "image/jpg";
        break;
      case ".wav":
        contentType = "audio/wav";
        break;
    }

    fs.readFile(filePath, function(error, content) {
      if (error) {
        if (error.code == "ENOENT") {
          fs.readFile("./404.html", function(error, content) {
            response.writeHead(200, { "Content-Type": contentType });
            response.end(content, "utf-8");
          });
        } else {
          response.writeHead(500);
          response.end(
            "Sorry, check with the site admin for error: " +
              error.code +
              " ..\n"
          );
          response.end();
        }
      } else {
        response.writeHead(200, { "Content-Type": contentType });
        response.end(content, "utf-8");
      }
    });
  })
  .listen(5000);

console.log("Server running at http://127.0.0.1:5000/");
