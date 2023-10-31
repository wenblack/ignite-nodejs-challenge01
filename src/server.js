import http from 'node:http'
import { json } from './middlewares/json.js'
import { routes } from './routes/index.js'
import { extractQueryParams } from './utils/extract-query-params.js'

/* Query Parameters: URL Stateful => Filters, pagination, optional fields and resources 
  http://localhost:3333/users?userId=1&name=Diego 
*/

/* Route Parameters: Resource identification , delete 
 GET http://localhost:3333/users/1
 DELETE http: //localhost:3333/users/1
*/

/* Request Body: Send form data (HTTPs)
 POST http://localhost:3333/users
*/



const server = http.createServer(async (req, res) => {
  const { method, url } = req

  await json(req, res)

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

server.listen(3333)