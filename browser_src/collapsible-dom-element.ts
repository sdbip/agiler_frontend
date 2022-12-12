import { Selector } from './class-name.js'
import { DOMElement } from './dom-element.js'

export class CollapsibleElement extends DOMElement {

  constructor(element: HTMLElement) { super(element) }

  static find(selector: Selector, rootElement: DOMElement): CollapsibleElement | null {
    const element = DOMElement.single(selector, rootElement)
    if (!element) return null
    return new CollapsibleElement(element.element)
  }

  expandTo(height: number) {
    this.element.style.height = `${height}px`
  }

  equals(other: DOMElement) {
    return other.element === this.element
  }
}
