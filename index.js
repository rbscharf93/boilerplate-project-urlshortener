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
app.use('/api/shorturl/', express.urlencoded());
// app.use('/api/shorturl/:shorturl');

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:shorturl', function(req, res) {
  const shorturl = shorturls.find(shorturl => shorturl.shortPath == req.params.shorturl);
  if (shorturl) {
    res.redirect(shorturl.url);
  } else {
    res.status(404);
  }
});

app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;
  const hostRegex = /https?:\/\/([a-zA-Z0-9\.]+)\//;
  const hostMatch = url.match(hostRegex);
  const host = hostMatch ? hostMatch[1] : 'invalid-url';
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
      })
      res.json({
        original_url: url,
        short_url: shortPath
      });
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
