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
import { ItemComponent, ItemComponentEvent } from '../item-component.js'

(async () => {
  const pageContainer = DOMElement.single({ id: 'page-container' })
  if (!pageContainer) throw Error('page container not found')
  pageContainer.setInnerHTML(await render('page-component', {}))
  updateItems()
})()

const cache = new ItemCache(new Backend())

// EVENT HANDLERS

// TODO: This is not good: It's untested. It's repeated in index.ts. And it's not trivially correct.
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
  const component = ItemComponent.parentComponent(element)
  switch (name) {
    case 'help-mouseover': {
      const popup = await Popup.forSnippet(element.getData('snippet'))
      popup.showNear(new DOMElement(args.element))
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
      notifyUI(name as ItemComponentEvent, args.element.dataset.id, args)
      break
    case 'title-keydown':
      if (isEnterPressed(args.event as KeyboardEvent))
        await addFeature({ id: component?.itemId as string })
      break
    case 'add-button-clicked':
      await addFeature({ id: component?.itemId as string })
      break
    case 'disclosure-button-clicked':
      await toggleDisclosed({ id: args.element.dataset.id as string })
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

function notifyUI(event: ItemComponentEvent, itemId?: string, args?: any) {
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
  notifyUI(wasDisclosed ? ItemComponentEvent.Collapse : ItemComponentEvent.Disclose, id)
}

// END EVENT HANDLERS

async function updateItems(epicId?: string) {
  notifyUI(ItemComponentEvent.Loading, epicId)
  try {
    await cache.fetchItems(epicId, [ ItemType.Epic, ItemType.Feature ])
  } finally {
    notifyUI(ItemComponentEvent.LoadingDone, epicId)
  }
}
