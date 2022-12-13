import { env } from 'process'

export const READ_MODEL_URL = env["READ_MODEL_URL"] as string
export const WRITE_MODEL_URL = env["WRITE_MODEL_URL"] as string
export const PORT = env['PORT'] as string
export const DIST_DIR = env['DIST_DIR'] ?? ''
