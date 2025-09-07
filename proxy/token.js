import jsonwebtoken from 'jsonwebtoken';

const options = {
  expiresIn: '1000000h', // Token expiration time
};
const peppolId = process.argv[2];
if (!peppolId) {
  throw new Error('Usage: node token.js 0208:1023290711');
}
const accessTokenKey = process.env.ACCESS_TOKEN_KEY;
if (!accessTokenKey) {
  throw new Error('Please set the ACCESS_TOKEN_KEY environment variable');
}
const payload = { peppolId };
const token = jsonwebtoken.sign(payload, accessTokenKey, options);
console.log(token);
