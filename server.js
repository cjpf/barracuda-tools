const express = require('express');
const app = express();
const dns = require('dns');
const port = 5000;

app.get('/api/dnsA', (req, res) => {
  dns.resolve('charliejuliet.net', 'A', (err, records) => {
    res.json(records);
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
