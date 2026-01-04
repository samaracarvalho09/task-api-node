// middlewares/cors.js
export function cors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
}
