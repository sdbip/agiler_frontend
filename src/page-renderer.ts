import Mustache from 'mustache'
import path from 'path'
import { promises as fs } from 'fs'
import { HTMLDocument } from 'happy-dom'
import { marked } from 'marked'
import { fileURLToPath } from 'url'
import * as env from './config.js'

export class PageRenderer {
  private constructor(readonly document: HTMLDocument) { }

  static async mustache(page: string) {
    const data = await fs.readFile(resolve(`../${env.DIST_DIR}/pages/template.mustache.html`))
    const template = data.toString('utf-8')
      .replace('{{READ_MODEL_URL}}', env.READ_MODEL_URL)
      .replace('{{WRITE_MODEL_URL}}', env.WRITE_MODEL_URL)
    const html = Mustache.render(template, { page })
    return this.read(html)
  }

  static read(html: string) {
    const document = new HTMLDocument()
    document.documentElement.outerHTML = html
    return new PageRenderer(document)
  }

  async inject(page: string) {
    const data = await fs.readFile(resolve(`../${env.DIST_DIR}/pages/${page}.md`))
    const markdown = data.toString('utf-8')
    const html = marked.parse(markdown)
    this.document.body.innerHTML = html
  }

  render() {
    return `<!DOCTYPE html>${this.document.documentElement.outerHTML}`
  }
}

export async function render(page: string) {
  const renderer = await PageRenderer.mustache(page)
  await renderer.inject(page)
  return renderer.render()
}

export function resolve(relPath: string) {
  const thisFile = fileURLToPath(import.meta.url)
  const thisDir = path.dirname(thisFile)
  return path.join(thisDir, relPath)
}
