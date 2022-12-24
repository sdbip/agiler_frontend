import { ItemDTO, ItemType, Progress } from './backend/dtos.js'
import { IDGenerator as IDGeneratorImpl } from './id-generator.js'

export class CachedItem {
  private constructor(readonly item: ItemDTO, readonly unverified: boolean) { }

  static item(item: ItemDTO) {
    return new CachedItem(item, false)
  }

  static unverified(item: ItemDTO) {
    return new CachedItem(item, true)
  }
}
type Handler = (items: ItemDTO[]) => void

export interface Backend {
  fetchItem(id: string): Promise<ItemDTO | undefined>
  fetchItems(parentId: string | undefined, types: ItemType[]): Promise<ItemDTO[]>

  addItem(title: string, type: ItemType, parentId: string | undefined): Promise<{ id: string }>
  promoteTask(id: string): Promise<void>
  completeTask(id: string): Promise<void>
}

export enum ItemCacheEvent {
  ItemsAdded = 'items_added',
  ItemsRemoved = 'items_removed',
  ItemsChanged = 'items_changed',
  IdChanged = "id_changed"
}

interface IDGenerator {
  next(): string
}

export class ItemCache {
  private handlers: { [_ in ItemCacheEvent]?: Handler[] } = {}
  private itemsByParent: { [id: string]: CachedItem[] } = {}

  constructor(private readonly backend: Backend, private readonly idGenerator: IDGenerator = new IDGeneratorImpl()) { }

  async fetchItems(storyId: string | undefined, types: ItemType[]) {
    const items = await this.backend.fetchItems(storyId, types)
    this.update(storyId, items)
    return items
  }

  cacheItem(cachedItem: CachedItem) {
    const items = this.getItems(cachedItem.item.parentId)
    if (items) items.push(cachedItem)
    else this.setItems(cachedItem.item.parentId, [ cachedItem ])
  }

  async addItem(type: ItemType, title: string, parentId?: string) {
    const item: ItemDTO = {
      id: this.idGenerator.next(),
      progress: Progress.NotStarted,
      title,
      parentId,
      type,
    }
    this.cacheItem(CachedItem.unverified(item))
    this.notify(ItemCacheEvent.ItemsAdded, [ item ])

    if (parentId) this.updateItem(parentId, item => ({ ...item, type: ItemType.Epic }))
    const response = await this.backend.addItem(title, type, parentId)
    this.updateItemId(item, response.id)
  }

  async promoteTask(id: string) {
    this.updateItem(id, item => ({ ...item, type: ItemType.Story }))
    await this.backend.promoteTask(id)
  }

  async completeTask(id: string) {
    this.updateItem(id, item => ({ ...item, progress: Progress.Completed }))
    await this.backend.completeTask(id)
  }

  private updateItemId(item: ItemDTO, newId: string) {
    const cachedItem = this.getCachedItem(item.id)
    if (!cachedItem) throw new Error("Item hasn't been cached")

    const items = this.getItems(item.parentId)
    if (!items) throw new Error("Item hasn't been cached")

    const index = items.indexOf(cachedItem)
    const changedItem = CachedItem.unverified({ ...cachedItem.item, id: newId })
    items[index] = changedItem
    this.notify(ItemCacheEvent.IdChanged, [ { ...item, newId } as ItemDTO ])
  }

  private updateItem(id: string, applyChanges: (_: ItemDTO) => ItemDTO) {
    const cachedItem = this.getCachedItem(id)
    if (!cachedItem) return

    const items = this.getItems(cachedItem.item.parentId)
    if (!items) throw new Error("Item hasn't been cached")

    const index = items.indexOf(cachedItem)
    const changedItem = applyChanges(cachedItem.item)
    items[index] = CachedItem.item(changedItem)
    this.notify(ItemCacheEvent.ItemsChanged, [ changedItem ])
  }

  private update(parentId: string | undefined, items: ItemDTO[]) {
    const knownItems = this.getItems(parentId) ?? []
    this.setItems(parentId, items.map(i => CachedItem.item(i)))

    const addedItems = items.filter(i1 => !knownItems.find(i2 => i1.id === i2.item.id))
    const removedItems = knownItems.filter(i => !i.unverified && items.findIndex(i2 => i2.id === i.item.id) < 0)
    const changedItems = items.filter(i1 => {
      const existing = knownItems.find(i2 => i1.id === i2.item.id)
      return existing && (existing.item.title !== i1.title)
    })

    this.notify(ItemCacheEvent.ItemsAdded, addedItems)
    this.notify(ItemCacheEvent.ItemsRemoved, removedItems.map(ci => ci.item))
    this.notify(ItemCacheEvent.ItemsChanged, changedItems)
  }

  on(event: ItemCacheEvent, handler: (items: ItemDTO[]) => void) {
    const handlers = this.handlers[event]
      ?? (this.handlers[event] = [])
    handlers.push(handler)
  }

  private notify(event: ItemCacheEvent, items: ItemDTO[]) {
    const handlers = this.handlers[event]
    if (!handlers || items.length === 0) return

    for (const handler of handlers)
      handler(items)
  }

  getCachedItem(id: string): CachedItem | undefined {
    return Object.values(this.itemsByParent).flat().find(i => i.item.id === id)
  }

  private getItems(parentId: string | undefined): CachedItem[] | undefined {
    return this.itemsByParent[parentId ?? '$null']
  }

  private setItems(parentId: string | undefined, items: CachedItem[]) {
    this.itemsByParent[parentId ?? '$null'] = items
  }
}
