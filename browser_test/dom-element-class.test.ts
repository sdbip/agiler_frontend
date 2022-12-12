import { assert } from '@esm-bundle/chai'
import { ClassName } from '../browser_src/class-name.js'
import { DOMElement } from '../browser_src/dom-element.js'

describe(DOMElement.name, () => {

  describe('class-name manipulation', () => {

    let element: DOMElement
    let htmlElement: HTMLElement

    beforeEach(() => {
      htmlElement = document.createElement('div')
      element = new DOMElement(htmlElement)
    })

    describe('hasClass', () => {

      const expected = ClassName.default

      it('returns false for no class', () => {
        htmlElement.className = ''
        assert.isFalse(element.hasClass(ClassName.default))
      })

      it('returns false if has other class', () => {
        htmlElement.className = `not-${expected.name}`
        assert.isFalse(element.hasClass(expected))
      })

      it('returns true if has expected', () => {
        htmlElement.className = expected.name
        assert.isTrue(element.hasClass(expected))
      })

      it('returns true if has expected after decoy', () => {
        htmlElement.className = `not-${expected.name} ${expected.name}`
        assert.isTrue(element.hasClass(expected))
      })

      it('returns true if has expected among other', () => {
        htmlElement.className = `${expected.name} other`
        assert.isTrue(element.hasClass(expected))
      })

    })

    describe('addClass', () => {

      const added = ClassName.default
      const other = ClassName.inactive

      it('sets class on the element', () => {
        htmlElement.className = ''
        element.addClass(added)
        assert.isTrue(element.hasClass(added))
      })

      it('keeps other class names', () => {
        htmlElement.className = other.name
        element.addClass(added)
        assert.isTrue(element.hasClass(added))
        assert.isTrue(element.hasClass(other))
      })

      it('does not repeat class', () => {
        htmlElement.className = added.name
        element.addClass(added)
        assert.equal(htmlElement.className, added.name)
      })

    })

    describe('removeClass', () => {

      const removed = ClassName.default
      const other = ClassName.inactive

      it('removes class from the element', () => {
        htmlElement.className = removed.name
        element.removeClass(removed)
        assert.isFalse(element.hasClass(removed))
      })

      it('does not remove other class names', () => {
        htmlElement.className = `${other.name} ${removed.name}`
        element.removeClass(removed)
        assert.isTrue(element.hasClass(other))
        assert.isFalse(element.hasClass(removed))
      })

      it('does not remove decoy class names', () => {
        htmlElement.className = `not-${removed.name} ${removed.name}`
        element.removeClass(removed)
        assert.isFalse(element.hasClass(removed))
        assert.equal(htmlElement.className, `not-${removed.name}`)
      })

      it('removes repeated occurrences', () => {
        htmlElement.className = `${removed.name} ${removed.name}`
        element.removeClass(removed)
        assert.isFalse(element.hasClass(removed))
      })

    })
  })
})
