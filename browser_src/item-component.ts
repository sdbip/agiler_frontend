import { ItemDTO } from './backend/dtos.js'
import { guard } from './guard-clauses.js'
import { ClassName, Selector, toSelector } from './class-name.js'
import { CollapsibleElement } from './collapsible-dom-element.js'
import { DOMElement } from './dom-element.js'
import { MeasureComponent } from './measure-component.js'
import { delay } from './delay.js'
import { render } from './templates.js'

export enum ItemComponentEvent {
  Focus = 'focus',
  Input = 'input',
  Blur = 'blur',
  Loading = 'loading',
  LoadingDone = 'loading-done',
  ItemsAdded = 'items_added',
  ItemChanged = 'item_changed',
  ItemRemoved = 'item_removed',
  IdChanged = 'id_changed',
}

export class ItemComponent {

  get parentComponent() {
    return ItemComponent.parentComponent(this.element.parentElement)
  }

  get itemId() {
    return this.element.getData('id') as string
  }

  get title() { return this.titleInputElement?.inputElementValue }

  get isDisclosed() {
    return this.element.hasClass(ClassName.disclosed)
  }

  get titleInputElement() {
    return this.getElement({ className:{ name: 'item-title' } })
  }
  get addButtonElement() {
    return this.getElement({ className:{ name: 'add-button' } })
  }

  get itemListElement() {
    return this.getElement({ className:{ name: 'item-list' } })
  }

  static forId(id: string) {
    const element = DOMElement.single({ id: `item-${id}` })
    return element && new ItemComponent(element)
  }
  private constructor(readonly element: DOMElement) { }

  static parentComponent(element: DOMElement | null): ItemComponent | null {
      if (!element) return null
      if (element.id.startsWith('item-') &&
        !element.id.startsWith('item-list')) return new ItemComponent(element)
      return this.parentComponent(element.parentElement)
  }

  private getElement(selector: Selector) {
    return DOMElement.single(selector, this.element)
  }

  async stopSpinnerAfter(runIt: () => Promise<void>) {
    try {
      await runIt()
    } finally {
      this.stopSpinner()
    }
  }

  async handleUIEvent(name: ItemComponentEvent, args?: any) {
    switch (name) {
      case ItemComponentEvent.Focus:
      case ItemComponentEvent.Input:
        if (this.title)
          this.highlightAddButton()
        else
          this.unhighlightAddButton()
        break
      case ItemComponentEvent.Blur:
        this.unhighlightAddButton()
        break
      case ItemComponentEvent.Loading:
        this.startSpinner()
        break
      case ItemComponentEvent.LoadingDone:
        this.stopSpinner()
        break
      case ItemComponentEvent.ItemsAdded:
        await this.addComponents(args.items)
        break
      case ItemComponentEvent.ItemChanged:
        this.updateDetails(args)
        break
      case ItemComponentEvent.ItemRemoved:
        this.element.addClass(ClassName.hidden)
        await delay(200)
        this.element.remove()
        break
      case ItemComponentEvent.IdChanged:
        this.element.element.id = `item-${args}`
        this.element.setData('id', args)
        break
    }
  }

  private updateDetails(args: any) {
    this.getElement({ className: { name: 'title' } })?.setInnerHTML(args.item.title)
    this.element.setData('type', args.item.type)
    this.element.setData('progress', args.item.progress)
  }

  private async addComponents(items: ItemDTO[]) {
    const listElement = guard.exists(this.itemListElement, 'should have a list element')

    const html = await render('item-list', {
      items,
      canComplete: () => function (this: any, text: string, render: any) {
        return this.type === 'Task' ? render(text) : ''
      },
    })
    const newElements = DOMElement.fromHTML(`<div>${html}</div>`).children
    for (const element of newElements) listElement.add(element)

    const collapsibleElement = getCollapsible(this)
    const height = MeasureComponent.instance.measure(collapsibleElement.innerHTML).height

    for (const element of newElements) {
      element.remove()
      element.addClass(ClassName.hidden)
    }

    for (const element of newElements) {
      listElement.add(element)
      element.removeClass(ClassName.hidden)
    }

    collapsibleElement.setHeight(height)
  }

  disclose() {
    this.element.addClass(ClassName.disclosed)
    this.setCollapsibleHeight(this.measureCollapsibleInstrinsicHeight())
  }

  collapse() {
    this.element.removeClass(ClassName.disclosed)
    this.setCollapsibleHeight(0)
  }

  private measureCollapsibleInstrinsicHeight() {
    const intrinsicSize = MeasureComponent.instance.measure(getCollapsible(this).innerHTML)
    return intrinsicSize.height
  }

  private setCollapsibleHeight(height: number) {
    getCollapsible(this).setHeight(height)
  }

  private startSpinner() {
    const spinnerElement = this.getElement(toSelector('.spinner'))
    spinnerElement?.removeClass(ClassName.inactive)
  }

  private stopSpinner() {
    const spinnerElement = this.getElement(toSelector('.spinner'))
    spinnerElement?.addClass(ClassName.inactive)
  }

  private highlightAddButton() {
    const buttonElement = this.addButtonElement
    buttonElement?.addClass(ClassName.default)
  }

  private unhighlightAddButton() {
    const buttonElement = this.addButtonElement
    buttonElement?.removeClass(ClassName.default)
  }
}

function getCollapsible(storyComponent: ItemComponent) {
  const element = CollapsibleElement.find({ className: { name: 'collapsible' } }, storyComponent.element)
  guard.that(element instanceof CollapsibleElement, `Collapsible element for story ${storyComponent.itemId} is missing`)
  return element as CollapsibleElement
}
