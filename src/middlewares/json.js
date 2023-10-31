export async function json(req, res) {
  const buffers = []
  //async function to set/get data for Array
  for await (const chunk of req) {
    buffers.push(chunk)
  }

  //try function to convert data to JSON (for response)
  try {
    req.body = JSON.parse(Buffer.concat(buffers).toString())
  } catch {
    req.body = null
  }

  res.setHeader('Content-type', 'application/json')
}