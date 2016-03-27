var expressJwt = require('express-jwt');
var jwtSecret = process.env.JWT_SECRET;

var auth = expressJwt({
  secret: jwtSecret,
  getToken: function customGetToken(req) {
    var headAuth = req.headers.authorization;
    var isBearerStart = headAuth && headAuth.split(' ')[0] === 'Bearer';
    if (isBearerStart) {
      return headAuth.split(' ') [1];
    }
    if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  }
});

module.exports = auth;
