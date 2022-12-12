import { assert } from '@esm-bundle/chai'
import { ClassSelector, TagSelector, toSelector } from '../browser_src/class-name.js'
import { DOMElement } from '../browser_src/dom-element.js'

describe(DOMElement.name, () => {

  describe('single', () => {

    it('finds element by id', () => {
      const element = document.createElement('div')
      element.id = 'this_element'
      document.body.appendChild(element)

      const html = DOMElement.single(toSelector('#this_element'))
      assert.exists(html)
      assert.equal(html?.id, 'this_element')

      document.body.removeChild(element)
    })

    it('finds element by tag name', () => {
      const element = document.createElement('div')
      element.id = 'this_element'
      document.body.appendChild(element)

      const html = DOMElement.single(toSelector('div'))
      assert.exists(html)
      assert.equal(html?.id, 'this_element')

      document.body.removeChild(element)
    })

    it('finds element by class name', () => {
      const element = document.createElement('div')
      element.className = 'this-element'
      element.id = 'this_element'
      document.body.appendChild(element)

      const html = DOMElement.single(toSelector('.this-element'))
      assert.exists(html)
      assert.equal(html?.id, 'this_element')

      document.body.removeChild(element)
    })

    it('finds child element by class name', () => {
      const element = document.createElement('div')
      element.innerHTML = '<div class="this-element"></div>'

      const html = DOMElement.single(toSelector('.this-element'), new DOMElement(element))
      assert.exists(html)
    })

    it('finds child element by tag name', () => {
      const element = document.createElement('div')
      element.innerHTML = '<div class="this-element"></div>'

      const html = DOMElement.single(toSelector('div'), new DOMElement(element))
      assert.exists(html)
    })
  })

  describe('all', () => {

    it('finds elements by tag name', () => {
      const element = document.createElement('div')
      element.id = 'this_element'
      document.body.appendChild(element)

      const htmls = DOMElement.all(toSelector('div') as TagSelector)
      assert.lengthOf(htmls, 1)
      assert.isTrue(new DOMElement(element).equals(htmls[0]))

      document.body.removeChild(element)
    })

    it('finds elements by class name', () => {
      const element = document.createElement('div')
      element.className = 'this-element'
      element.id = 'this_element'
      document.body.appendChild(element)

      const htmls = DOMElement.all(toSelector('.this-element') as ClassSelector)
      assert.lengthOf(htmls, 1)
      assert.isTrue(new DOMElement(element).equals(htmls[0]))

      document.body.removeChild(element)
    })

    it('finds child elements by class name', () => {
      const element = document.createElement('div')
      element.innerHTML = '<div class="this-element"></div>'

      const htmls = new DOMElement(element).decendants(toSelector('.this-element') as ClassSelector)
      assert.lengthOf(htmls, 1)
    })

    it('finds child elements by tag name', () => {
      const element = document.createElement('div')
      element.innerHTML = '<div class="this-element"></div>'

      const htmls = new DOMElement(element).decendants(toSelector('.this-element') as ClassSelector)
      assert.lengthOf(htmls, 1)
    })

    it('can remove itself', () => {
      const element = document.createElement('div')
      document.body.append(element)
      new DOMElement(element).remove()
      assert.notExists(element.parentElement)
    })
  })
})
