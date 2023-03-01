import { assert } from 'chai'
import { PageRenderer, render } from '../src/page-renderer'

describe(render.name, () => {

  it('returns a valid HTML document', async () => {
    const html = await render('stories-and-tasks')
    assert.match(html, /^<!DOCTYPE html>/)
  })

  it('includes the page\'s own script', async () => {
    const renderer = await PageRenderer.mustache('random_page_name')
    const document = renderer.document
    const scripts = [ ...document.scripts ]
    const pageScript = scripts.find(s => s.src === 'public/random_page_name.bundle.js')
    assert.exists(pageScript)
    assert.equal(pageScript?.type, 'text/javascript')
  })

  it('includes the page\'s own style-sheet', async () => {
    const renderer = await PageRenderer.mustache('random_page_name')
    const document = renderer.document
    const linkTags = [ ...document.getElementsByTagName('link') ].map(e => e as unknown as HTMLLinkElement)
    const pageStyleSheet = linkTags.find(s => s.href === 'public/styles/random_page_name.css')
    assert.exists(pageStyleSheet)
    assert.equal(pageStyleSheet?.type, 'text/css')
  })

  it('populates the index page', async () => {
    const renderer = await PageRenderer.mustache('stories-and-tasks')
    await renderer.inject('stories-and-tasks')
    const document = renderer.document
    assert.notEqual(document.body.innerHTML, '')
    assert.isTrue(document.body.innerHTML.startsWith('<'))
  })

  it('populates the features page', async () => {
    const renderer = await PageRenderer.mustache('features')
    await renderer.inject('features')
    const document = renderer.document
    assert.notEqual(document.body.innerHTML, '')
    assert.isTrue(document.body.innerHTML.startsWith('<'))
  })
})
