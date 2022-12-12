import { assert } from '@esm-bundle/chai'
import { DOMElement } from '../browser_src/dom-element.js'

describe(DOMElement.name, () => {

  let element: DOMElement
  let htmlElement: HTMLElement

  beforeEach(() => {
    htmlElement = document.createElement('div')
    element = new DOMElement(htmlElement)
  })

  describe('setData', () => {

    it('sets data attribute', () => {
      element.setData('type', 'Epic')
      const value = htmlElement.getAttribute('data-type')
      assert.equal(value, 'Epic')
    })
  })

  describe('getData', () => {

    it('gets data attribute value', () => {
      htmlElement.setAttribute('data-type', 'Epic')
      const value = element.getData('type')
      assert.equal(value, 'Epic')
    })
  })
})
