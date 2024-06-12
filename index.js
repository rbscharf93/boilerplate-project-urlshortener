require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('node:dns');
const { path } = require('express/lib/application');

const app = express();

const shorturls = [];

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use('/api/shorturl/', express.urlencoded({extended: true}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  console.log(`POSTED /api/shorturl`);
  const url = req.body.url;
  const hostRegex = /https?:\/\/([-a-zA-Z0-9\.]+)\//;
  const hostMatch = url.match(hostRegex);
  const host = hostMatch ? hostMatch[1] : 'invalid-url';
  console.log(`url: ${url}`);
  console.log(`host: ${host}`);
  dns.lookup(host, function(err, address) {
    if (err) {
      res.json({error: 'invalid url'});
    } else {
      let shorturl = shorturls.find(shorturl => shorturl.url === url);
      let shortPath;
      if (shorturl) {
        shortPath = shorturl.shortPath;
      } else {
        shorturls.push({url: url, shortPath: shorturls.length + 1});
        shortPath = shorturls.length;
      }
      console.log({
        original_url: url,
        short_url: shortPath
      });
      res.json({
        original_url: url,
        short_url: shortPath
      });
    }
  });
});

app.get('/api/shorturl/:shorturl', function(req, res) {
  const shorturl = shorturls.find(shorturl => shorturl.shortPath == req.params.shorturl);
  if (shorturl) {
    console.log(`shorturl: ${req.params.shorturl}`);
    res.redirect(shorturl.url);
  } else {
    console.log(`404: shorturl: ${req.params.shorturl}`);
    // res.status(404);
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
