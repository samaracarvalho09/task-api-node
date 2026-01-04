import http from 'node:http'

import { json } from './middlewares/json.js'
import { cors } from './middlewares/cors.js';
import { routes } from './routes.js'
import { extractQueryParams } from './utils/extract-query-params.js'

const server = http.createServer(async (req, res) => {
  const { method, url } = req

    // ✅ CORS primeiro
  cors(req, res);

  // ✅ Preflight (OBRIGATÓRIO)
  if (method === 'OPTIONS') {
    return res.writeHead(204).end();
  }

  await json(req, res)

  console.log('METHOD:', req.method)
  console.log('HEADERS:', req.headers)
  console.log('RAW BODY:', req.body)


  const route = routes.find(route => {
    return route.method === method && route.path.test(url)
  })

  if (route) {
    const routeParams = req.url.match(route.path)

    const { query, ...params } = routeParams.groups

    req.params = params
    req.query = query ? extractQueryParams(query) : {}

    return route.handler(req, res)
  }

  return res.writeHead(404).end()
})

server.listen(3335)
