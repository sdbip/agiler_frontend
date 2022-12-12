import { marked } from 'marked'
import { DOMElement } from '../dom-element.js'

export class Popup {
  constructor(readonly element: DOMElement) { }

  static async forSnippet(snippet: string | undefined) {
    const existingPopupElement = DOMElement.single({ id: `popup:${snippet}` })
    const popupElement = existingPopupElement
      ?? DOMElement.fromHTML(`<div id="popup:${snippet}" class="pop-up"></div>`)

    if (!existingPopupElement) {
      DOMElement.BODY.add(popupElement)
      const response = await fetch(`public/popups/${snippet}.md`)
      popupElement.setInnerHTML(marked.parse(await response.text()))
    }
    return new Popup(popupElement)
  }

  showNear(targetElement: DOMElement) {
    const popup = this.element.element
    const targetBox = targetElement.element.getBoundingClientRect()
    const position = {
      x: targetBox.left + 10,
      y: targetBox.top + targetBox.height + 10,
    }

    const style = popup.style
    style.display = 'revert'

    const popupBox = popup.getBoundingClientRect()
    const maxWidth = document.documentElement.clientWidth
    if (position.x + popupBox.width + 10 > maxWidth)
      position.x = maxWidth - (popupBox.width + 10)

    style.top = `${position.y}px`
    style.left = `${position.x}px`
  }

  hide() {
    this.element.element.style.display = ''
  }
}
