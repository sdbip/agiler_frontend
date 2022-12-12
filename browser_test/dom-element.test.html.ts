import { assert } from '@esm-bundle/chai'
import { runTests } from '@web/test-runner-mocha'
import { DOMElement, DOMEvent } from '../browser_src/dom-element.js'

runTests(() => {
  describe(DOMElement.name, () => {

    it('can be created from HTML', () => {
      const element = DOMElement.fromHTML('<div></div>')
      assert.lengthOf(DOMElement.BODY.children, 1)
      DOMElement.BODY.add(element)
      assert.lengthOf(DOMElement.BODY.children, 2)
    })

    describe('event dispatch', () => {

      it('dispatches mouseover', () => {
        const htmlElement = document.createElement('div')
        const element = new DOMElement(htmlElement)

        let handledEvent: DOMEvent | undefined
        element.on('mouseover', event => { handledEvent = event })

        htmlElement.dispatchEvent(new MouseEvent('mouseover', {}))

        assert.exists(handledEvent)
        assert.equal(handledEvent?.element, element)
        assert.equal(handledEvent?.name, 'mouseover')
        assert.instanceOf(handledEvent?.eventData, MouseEvent)
      })

      it('dispatches mouseout', () => {
        const htmlElement = document.createElement('div')
        const element = new DOMElement(htmlElement)

        let handledEvent: DOMEvent | undefined
        element.on('mouseout', event => { handledEvent = event })

        htmlElement.dispatchEvent(new MouseEvent('mouseout', {}))

        assert.exists(handledEvent)
        assert.equal(handledEvent?.element, element)
        assert.equal(handledEvent?.name, 'mouseout')
        assert.instanceOf(handledEvent?.eventData, MouseEvent)
      })

      it('dispatches input when value changes', () => {
        const htmlElement = document.createElement('input')
        const element = new DOMElement(htmlElement)

        let handledEvent: DOMEvent | undefined
        element.on('input', event => { handledEvent = event })

        element.setInputElementValue('a value')

        assert.exists(handledEvent)
        assert.equal(handledEvent?.element, element)
        assert.equal(handledEvent?.name, 'input')
        assert.instanceOf(handledEvent?.eventData, InputEvent)
      })
    })
  })
})
