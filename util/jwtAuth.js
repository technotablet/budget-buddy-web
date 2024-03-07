const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

// JWT validation middleware
let checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.ISSUER_BASE_URL}/.well-known/jwks.json`
    }),
    audience: 'http://localhost:3000/*',
    issuer: `${process.env.ISSUER_BASE_URL}/`,
    algorithms: ['RS256']
});

module.exports = checkJwt;