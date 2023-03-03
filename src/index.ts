import { render, resolve } from './page-renderer.js'
import { setupServer } from './server.js'
import { DIST_DIR } from './config.js'

const setup = setupServer()

setup.public(resolve(`../${DIST_DIR}/public`))
setup.get('/', () => render('features'))
setup.get('/index', () => render('features'))
setup.get('/features', () => render('features'))
setup.get('/tasks', () => render('stories-and-tasks'))
setup.get('/stories', () => render('stories-and-tasks'))
setup.get('/stories-and-tasks', () => render('stories-and-tasks'))

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
