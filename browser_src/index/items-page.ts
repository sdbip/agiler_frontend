import globals from '../globals.js'
import { render } from '../templates.js'
import { DOMElement } from '../dom-element.js'
import { Popup } from './popup.js'
import { PageComponent } from '../page-component.js'
import { ItemCache, ItemCacheEvent } from '../item-cache.js'
import { Backend, Fetcher } from '../backend/backend.js'
import * as env from '../backend/config.js'
import { ItemType } from '../backend/dtos.js'
import { ItemComponent, ItemComponentEvent } from '../item-component.js'

export class ItemsPage {
  constructor(readonly newItemType: ItemType, readonly secondaryItemType: ItemType) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    page = this
  }

  async initialize() {
    const pageContainer = DOMElement.single({ id: 'page-container' })
    if (!pageContainer) throw Error('page container not found')
    pageContainer.setInnerHTML(await render('page-component', {}))
    updateItems()
  }
}

let page: ItemsPage

const backend = new Backend('frontend', new Fetcher(), env)
const cache = new ItemCache(backend)

// EVENT HANDLERS

cache.on(ItemCacheEvent.ItemsAdded, items => {
  notifyUI(ItemComponentEvent.ItemsAdded, items[0].parentId, { items })
})

cache.on(ItemCacheEvent.IdChanged, items => {
  notifyUI(ItemComponentEvent.IdChanged, items[0].id, (items[0] as any).newId)
})

cache.on(ItemCacheEvent.ItemsChanged, items => {
  for (const item of items)
    notifyUI(ItemComponentEvent.ItemChanged, item.id, { item })
})

cache.on(ItemCacheEvent.ItemsRemoved, items => {
  for (const item of items)
    notifyUI(ItemComponentEvent.ItemRemoved, item.id, { item })
})

globals.emitUIEvent = async (name: string, args: UIEventArgs) => {
  const element = new DOMElement(args.element)
  switch (name) {
    case 'help-mouseover': {
      const popup = await Popup.forSnippet(element.getData('snippet'))
      popup.showNear(element)
      break
    }
    case 'help-mouseout': {
      const popup = await Popup.forSnippet(element.getData('snippet'))
      popup?.hide()
      break
    }
    case 'focus':
    case 'input':
    case 'blur':
      notifyUI(name as ItemComponentEvent, itemId(element), args)
      break
    case 'complete-clicked':
      await completeTask({ id: itemId(element) as string })
      break
    case 'title-keydown':
      if (isEnterPressed(args.event as KeyboardEvent))
        await addItem({ id: itemId(element) as string })
      break
    case 'add-button-clicked':
      await addItem({ id: itemId(element) as string })
      break
    case 'disclosure-button-clicked':
      await toggleDisclosed({ id: itemId(element) as string })
      break
    case 'user-changed':
      backend.authenticatedUser = (args.element as HTMLSelectElement).value
      break
  }

  function isEnterPressed(event: KeyboardEvent) {
    if (event.metaKey || event.ctrlKey || event.altKey) return false
    return event.key === 'Enter'
  }
}

const helpElements = DOMElement.all({ className: { name: 'hover-help' } })
for (const helpElement of helpElements) {
  helpElement.on('mouseover', async event => {
    globals.emitUIEvent('help-mouseover', { event, element: event.eventData.target })
  })

  helpElement.on('mouseout', async event => {
    globals.emitUIEvent('help-mouseout', { event, element: event.eventData.target })
  })
}

const itemId = (element: DOMElement) => ItemComponent.parentComponent(element)?.itemId

function notifyUI(event: ItemComponentEvent, itemId?: string, args?: any) {
  const component = (itemId ? ItemComponent.forId(itemId) : undefined) ?? PageComponent.instance
  component.handleUIEvent(event, args)
}

const completeTask = async ({ id }: { id: string }) => {
  await cache.completeTask(id)
}

const addItem = async ({ id }: { id: string }) => {
  const component = ItemComponent.forId(id) ?? PageComponent.instance
  const titleElement = component.titleInputElement
  if (!component.title) return

  console.log(`add ${page.newItemType}`, await cache.addItem(page.newItemType, component.title, id))
  titleElement?.setInputElementValue('')

  await updateItems(component.itemId)
}

const toggleDisclosed = async ({ id }: { id: string }) => {
  const component = ItemComponent.forId(id)
  if (!component) throw new Error(`Component for item with id ${id} not found`)

  if (component.isDisclosed) {
    component.collapse()
  } else {
    component.disclose()
    await updateItems(id)
  }
}

// END EVENT HANDLERS

async function updateItems(parentId?: string) {
  const types = [ page.newItemType, page.secondaryItemType ]
  notifyUI(ItemComponentEvent.Loading, parentId)
  try {
    await cache.fetchItems(parentId, types)
  } finally {
    notifyUI(ItemComponentEvent.LoadingDone, parentId)
  }
}

type UIEventArgs = {
  itemId: string;
  event: Event;
  element: HTMLElement;
}
