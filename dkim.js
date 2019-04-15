module.exports = function() {
  const express = require("express");
  const router = express.Router();
  const dns = require("dns");

  router.route('/dkim').get(function(req, res) {
    dns.resolve(
      "protonmail._domainkey.charliejuliet.net",
      "TXT",
      (err, records) => {
        res.json(records);
      }
    );
  });

  return router;
};
