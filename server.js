const express = require("express");
const app = express();
const dns = require("dns");
const cors = require("cors");
const port = 5000;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: true }));
app.set("trust proxy", "loopback");

app.get("/api/dkim/:hostname", (req, res) => {
  dns.resolveTxt(req.params.hostname, (err, records) => {
    if (err) {
      console.log(err);
    }
    console.log("Retrieved " + records);
    res.json(records);
  });
});

app.get("/api/a/:hostname", (req, res) => {
  dns.resolve(req.params.hostname, "A", (err, records) => {
    if (err) {
      console.log(err);
    }
    console.log(res.json(records));
    res.json(records);
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
