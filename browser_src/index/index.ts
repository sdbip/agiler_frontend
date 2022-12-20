import globals from '../globals.js'
import { ItemComponent, ItemComponentEvent } from '../item-component.js'
import { PageComponent } from '../page-component.js'
import { ClassName } from '../class-name.js'
import { UIEventArgs } from './ui-event-args.js'
import { render } from '../templates.js'
import { ItemCache, ItemCacheEvent } from '../item-cache.js'
import { Backend } from '../backend/backend.js'
import { ItemType } from '../backend/dtos.js'

(async () => {
  const pageContainer = document.getElementById('page-container')
  if (!pageContainer) throw Error('page container not found')
  pageContainer.innerHTML = await render('page-component', {})
  updateItems()
})()

let temp_id = 1
const nextId = () => `new_${++temp_id}`
const cache = new ItemCache(new Backend(), nextId)

// EVENT HANDLERS

cache.on(ItemCacheEvent.ItemsAdded, items => {
  notifyUI(ItemComponentEvent.ItemsAdded, items[0].parentId, { items })
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
  switch (name) {
    case 'focus':
    case 'input':
    case 'blur':
      notifyUI(name as ItemComponentEvent, args.itemId, args)
      break
    case 'complete-clicked':
      await completeTask({ id: args.itemId })
      break
    case 'promote-clicked':
      await promote({ id: args.itemId })
      break
    case 'title-keydown':
      if (isEnterPressed(args.event as KeyboardEvent))
        await addTask({ id: args.itemId })
      break
    case 'add-button-clicked':
      await addTask({ id: args.itemId })
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

function notifyUI(event: ItemComponentEvent, itemId?: string, args?: any) {
  const component = (itemId ? ItemComponent.forId(itemId) : undefined) ?? PageComponent.instance
  component.handleUIEvent(event, args)
}

const completeTask = async ({ id }: { id: string }) => {

  await cache.completeTask(id)
}

const addTask = async ({ id }: { id: string }) => {
  const component = ItemComponent.forId(id) ?? PageComponent.instance
  const titleElement = component.titleInputElement
  if (!component.title) return

  console.log('add task', await cache.addItem(ItemType.Task, component.title, id))
  titleElement?.setInputElementValue('')

  await updateItems(component.itemId)
}

const promote = async ({ id }: { id: string }) => {
  await cache.promoteTask(id)
  await updateItems()
}

const toggleDisclosed = async ({ id }: { id: string }) => {
  const storyComponent = ItemComponent.forId(id)
  if (!storyComponent) throw new Error(`Component for story with id ${id} not found`)

  const wasDisclosed = storyComponent.element.hasClass(ClassName.disclosed)
  if (!wasDisclosed) await updateItems(id)
  notifyUI(wasDisclosed ? ItemComponentEvent.Collapse : ItemComponentEvent.Disclose, id)
}

// END EVENT HANDLERS

async function updateItems(storyId?: string) {
  notifyUI(ItemComponentEvent.Loading, storyId)
  try {
    await cache.fetchItems(storyId, [ ItemType.Story, ItemType.Task ])
  } finally {
    notifyUI(ItemComponentEvent.LoadingDone, storyId)
  }
}
