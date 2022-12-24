var _a;
import { env } from 'process';
export const READ_MODEL_URL = env["READ_MODEL_URL"];
export const WRITE_MODEL_URL = env["WRITE_MODEL_URL"];
export const PORT = env['PORT'];
export const DIST_DIR = (_a = env['DIST_DIR']) !== null && _a !== void 0 ? _a : '';
