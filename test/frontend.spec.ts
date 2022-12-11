import { assert } from 'chai'
import http, { IncomingMessage } from 'http'
import { PORT } from '../src/config.js'
import { start, stop } from '../src/index.js'

describe('server', () => {

  before(start)
  after(stop)

  it('finds static files', async () => {
    const response = await get(`http://localhost:${PORT}/public/styles/normalize-11.0.0.css`)
    assert.equal(response.statusCode, 200)
    assert.exists(response.content)
    assert.equal(response.content[0], '/')
  })

  it('responds to get /', async () => {
    const response = await get(`http://localhost:${PORT}`)
    assert.equal(response.statusCode, 200)
    assert.exists(response.content)
    assert.equal(response.content[0], '<')
  })

  it('responds to get /features', async () => {
    const response = await get(`http://localhost:${PORT}/features`)
    assert.equal(response.statusCode, 200)
    assert.exists(response.content)
    assert.equal(response.content[0], '<')
  })
})

type Response = {
  statusCode?: number
  content: string
}

function get(url: string) {
  return new Promise<Response>((resolve) => {
    const request = http.get(url, async response => {
      const result = await readResponse(response)
      resolve(result)
    })

    request.end()
  })
}

function readResponse(response: IncomingMessage): Promise<Response> {
  return new Promise((resolve) => {
    let result = ''
    response.setEncoding('utf-8')
    response.on('data', (content) => {
      result += content
    })
    response.on('end', () => {
      resolve({
        statusCode: response.statusCode,
        content: result,
      })
    })
  })
}
