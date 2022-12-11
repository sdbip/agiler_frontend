import Mustache from 'mustache'
import path from 'path'
import { promises as fs } from 'fs'
import { HTMLDocument } from 'happy-dom'
import { marked } from 'marked'
import { fileURLToPath } from 'url'

export class PageRenderer {
  private constructor(readonly document: HTMLDocument) { }

  static async mustache(page: string) {
    const data = await fs.readFile(resolve('../pages/template.mustache.html'))
    const html = Mustache.render(data.toString('utf-8'), { page })
    return this.read(html)
  }

  static read(html: string) {
    const document = new HTMLDocument()
    document.documentElement.outerHTML = html
    return new PageRenderer(document)
  }

  async inject(page: string) {
    const data = await fs.readFile(resolve(`../pages/${page}.md`))
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
