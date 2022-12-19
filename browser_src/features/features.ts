import globals from '../globals.js'
import { render } from '../templates.js'
import { UIEventArgs } from '../index/ui-event-args.js'
import { DOMElement } from '../dom-element.js'
import { Popup } from './popup.js'
import { PageComponent } from '../page-component.js'
import { ClassName } from '../class-name.js'
import { ItemCache, ItemCacheEvent } from '../item-cache.js'
import { Backend } from '../backend/backend.js'
import { ItemType } from '../backend/dtos.js'
import { ItemComponent } from '../item-component.js'

(async () => {
  const pageContainer = DOMElement.single({ id: 'page-container' })
  if (!pageContainer) throw Error('page container not found')
  pageContainer.setInnerHTML(await render('page-component', {}))
  updateItems()
})()

let temp_id = 1
const nextId = () => `new_${++temp_id}`
const cache = new ItemCache(new Backend(), nextId)

// EVENT HANDLERS

cache.on(ItemCacheEvent.ItemsAdded, items => {
  notifyUI('items_added', items[0].parentId, { items })
})

cache.on(ItemCacheEvent.ItemsChanged, items => {
  for (const item of items)
    notifyUI('item_changed', item.id, { item })
})

cache.on(ItemCacheEvent.ItemsRemoved, items => {
  for (const item of items)
    notifyUI('item_removed', item.id, { item })
})

globals.emitUIEvent = async (name: string, args: UIEventArgs) => {
  switch (name) {
    case 'help-mouseover': {
      const popup = await Popup.forSnippet(args.element.dataset.snippet)
      popup.showNear(new DOMElement(args.element))
      break
    }
    case 'help-mouseout': {
      const popup = await Popup.forSnippet(args.element.dataset.snippet)
      popup?.hide()
      break
    }
    case 'focus':
    case 'input':
    case 'blur':
      notifyUI(name, args.itemId, args)
      break
    case 'title-keydown':
      if (isEnterPressed(args.event as KeyboardEvent))
        await addFeature({ id: args.itemId })
      break
    case 'add-button-clicked':
      await addFeature({ id: args.itemId })
      break
    case 'disclosure-button-clicked':
      await toggleDisclosed({ id: args.itemId })
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

function notifyUI(event: string, itemId?: string, args?: any) {
  const component = (itemId ? ItemComponent.forId(itemId) : undefined) ?? PageComponent.instance
  component.handleUIEvent(event, args)
}

const addFeature = async ({ id }: { id: string }) => {
  const component = ItemComponent.forId(id) ?? PageComponent.instance
  const titleElement = component.titleInputElement
  if (!component.title) return

  console.log('add Feature', await cache.addItem(ItemType.Feature, component.title, id))
  titleElement?.setInputElementValue('')

  await updateItems(component.itemId)
}

const toggleDisclosed = async ({ id }: { id: string }) => {
  const epicComponent = ItemComponent.forId(id)
  if (!epicComponent) throw new Error(`Component for story with id ${id} not found`)

  const wasDisclosed = epicComponent.element.hasClass(ClassName.disclosed)
  if (!wasDisclosed) await updateItems(id)
  notifyUI(wasDisclosed ? 'collapse' : 'disclose', id)
}

// END EVENT HANDLERS

async function updateItems(epicId?: string) {
  notifyUI('loading', epicId)
  try {
    await cache.fetchItems(epicId, [ ItemType.Epic, ItemType.Feature ])
  } finally {
    notifyUI('loading-done', epicId)
  }
}
