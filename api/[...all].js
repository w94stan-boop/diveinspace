const app = require('../server/app');
const url = require('url');

module.exports = function(req, res) {
  const parsedUrl = url.parse(req.url);
  req.path = parsedUrl.pathname;
  req.query = {};
  
  if (parsedUrl.query) {
    parsedUrl.query.split('&').forEach(function(pair) {
      var parts = pair.split('=');
      req.query[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || '');
    });
  }
  
  app(req, res);
};
