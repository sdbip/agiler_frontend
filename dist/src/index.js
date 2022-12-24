var _a, _b;
import { render, resolve } from './page-renderer.js';
import { setupServer } from './server.js';
import { DIST_DIR } from './config.js';
const setup = setupServer();
setup.public(resolve(`../${DIST_DIR}/public`));
setup.get('/', () => render('index'));
setup.get('/index', () => render('index'));
setup.get('/features', () => render('features'));
const server = setup.finalize();
const port = (_b = parseInt((_a = process.env.PORT) !== null && _a !== void 0 ? _a : '80')) !== null && _b !== void 0 ? _b : 80;
server.listenAtPort(port);
process.stdout.write(`\x1B[35mListening on port \x1B[30m${port}\x1B[0m\n\n`);
export function start() {
    server.stopListening();
    server.listenAtPort(port);
}
export function stop() {
    server.stopListening();
}
