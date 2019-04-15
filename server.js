const express = require("express");
const app = express();
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({etended: true}));
const dns = require("dns");
const port = 5000;

// Proxy config
app.set("trust proxy", "loopback");

// Static routes
// app.use(express.static('public'));

// Express routers
// app.use('/', require('./dkim.js'));

app.get("/api/dkim", (req, res) => {
  dns.resolve(
    "protonmail._domainkey.charliejuliet.net",
    "TXT",
    (err, records) => {
      if (err) {
        console.log(err);
      }
      res.json(records);
    }
  );
});

app.post("/api/dkim", (req, res) => {
  dns.resolve(
    "protonmail._domainkey.charliejuliet.net",
    "TXT",
    (err, records) => {
      if (err) {
        console.log(err);
      }
      res.json(records);
    }
  );
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
