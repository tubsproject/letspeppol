import jsonwebtoken from 'jsonwebtoken';

const options = {
  expiresIn: '1000000h', // Token expiration time
};
const peppolId = process.argv[2];
if (!peppolId) {
  throw new Error('Usage: node token.js 0208:1023290711');
}
const secretKey = process.env.ACCESS_TOKEN_KEY;
if (!secretKey) {
  throw new Error('Please set the ACCESS_TOKEN_KEY environment variable');
}
const payload = { peppolId };
const token = jsonwebtoken.sign(payload, secretKey, options);
console.log(token);
