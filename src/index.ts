import { render, resolve } from './page-renderer.js'
import { setupServer } from './server.js'

const setup = setupServer()

setup.public(resolve('../public'))
setup.get('/', () => render('index'))
setup.get('/index', () => render('index'))
setup.get('/features', () => render('features'))

const server = setup.finalize()
const port = parseInt(process.env.PORT ?? '80') ?? 80
server.listenAtPort(port)

process.stdout.write(`\x1B[35mListening on port \x1B[30m${port}\x1B[0m\n\n`)

export function start() {
  server.stopListening()
  server.listenAtPort(port)
}

export function stop() {
  server.stopListening()
}
