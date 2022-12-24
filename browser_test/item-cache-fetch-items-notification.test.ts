import { assert } from '@esm-bundle/chai'
import { ItemDTO, ItemType, Progress } from '../browser_src/backend/dtos.js'
import { CachedItem, ItemCache, ItemCacheEvent } from '../browser_src/item-cache.js'
import { MockBackend } from './mocks'

describe(`${ItemCache.name}.fetchItems`, () => {

  const backend = new MockBackend()

  describe(`${ItemCacheEvent.ItemsAdded} event`, () => {

    it('notifies when items are ready', async () => {
      const item = {
        id: 'id',
        progress: Progress.NotStarted,
        title: 'title',
        type: ItemType.Task,
      }
      backend.itemsToReturn = [ item ]

      const cache = newCache()

      let notifiedItems: ItemDTO[] = []
      cache.on(ItemCacheEvent.ItemsAdded, (items) => {
        notifiedItems = items
      })

      const returnedItems = await cache.fetchItems(undefined, [ ItemType.Task ])

      assert.deepEqual(returnedItems, [ item ])
      assert.deepEqual(notifiedItems, [ item ])
    })

    it('does not notify existing items', async () => {
      const item1 = {
        id: '1',
        progress: Progress.NotStarted,
        title: 'Item 1',
        type: ItemType.Task,
      }
      const item2 = {
        id: '2',
        progress: Progress.NotStarted,
        title: 'Item 2',
        type: ItemType.Task,
      }
      backend.itemsToReturn = [ item1, item2 ]

      const cache = newCache()
      cache.cacheItem(CachedItem.item(item1))

      let notifiedItems: ItemDTO[] = []
      cache.on(ItemCacheEvent.ItemsAdded, items => {
        notifiedItems = items
      })

      await cache.fetchItems(undefined, [ ItemType.Task ])
      assert.notInclude(notifiedItems.map(i => i.id), '1')
    })

    it('does not notify at all if no items added', async () => {
      const item = {
        id: 'item',
        progress: Progress.NotStarted,
        title: 'Get it done',
        type: ItemType.Task,
      }
      backend.itemsToReturn = [ item ]

      const cache = newCache()
      cache.cacheItem(CachedItem.item(item))

      let isNotified = false
      cache.on(ItemCacheEvent.ItemsAdded, () => { isNotified = true })

      const returnedItems = await cache.fetchItems(undefined, [ ItemType.Task ])
      assert.deepEqual(returnedItems, [ item ])
      assert.isFalse(isNotified)
    })
  })

  describe(`${ItemCacheEvent.ItemsChanged} event`, () => {

    it('does not notify if only adding items', async () => {
      backend.itemsToReturn = [ {
        id: 'addedItem',
        progress: Progress.NotStarted,
        title: 'title',
        type: ItemType.Task,
      } ]

      const cache = newCache()

      let isNotified = false
      cache.on(ItemCacheEvent.ItemsChanged, () => {
        isNotified = true
      })

      await cache.fetchItems(undefined, [ ItemType.Task ])
      assert.isFalse(isNotified)
    })

    it('notifies items with changed title', async () => {
      const item = {
        id: 'item',
        progress: Progress.NotStarted,
        title: 'New title',
        type: ItemType.Task,
      }
      backend.itemsToReturn = [ item ]

      const cache = newCache()
      cache.cacheItem(CachedItem.item({ ...item, title: 'Title before' }))

      let changedItems: ItemDTO[] | undefined
      cache.on(ItemCacheEvent.ItemsChanged, items => {
        changedItems = items
      })

      await cache.fetchItems(undefined, [ ItemType.Task ])
      assert.deepEqual(changedItems, [ item ])
    })
  })

  describe(ItemCacheEvent.ItemsRemoved, () => {

    it('does not notify when only adding items', async () => {
      backend.itemsToReturn = [ {
        id: 'addedItem',
        progress: Progress.NotStarted,
        title: 'title',
        type: ItemType.Task,
      } ]

      const cache = newCache()

      let isNotified = false
      cache.on(ItemCacheEvent.ItemsRemoved, () => { isNotified = true })

      await cache.fetchItems(undefined, [ ItemType.Task ])
      assert.isFalse(isNotified)
    })

    it('does notify removed items after update', async () => {
      const item1 = {
        id: 'item1',
        progress: Progress.NotStarted,
        title: 'Get it done',
        type: ItemType.Task,
      }
      const item2 = {
        id: 'item2',
        progress: Progress.NotStarted,
        title: 'Get it done',
        type: ItemType.Task,
      }
      const itemWithParent = {
        id: 'itemWithParent',
        progress: Progress.NotStarted,
        title: 'Get it done',
        type: ItemType.Task,
        parentId: 'parent',
      }

      const cache = newCache()

      backend.itemsToReturn = [ item1 ]
      await cache.fetchItems(undefined, [ ItemType.Task ])
      backend.itemsToReturn = [ itemWithParent ]
      await cache.fetchItems('parent', [ ItemType.Task ])

      let isNotified = false
      cache.on(ItemCacheEvent.ItemsRemoved, () => {
        isNotified = true
      })

      backend.itemsToReturn = [ item2 ]
      await cache.fetchItems(undefined, [ ItemType.Task ])

      assert.isTrue(isNotified)
    })

    it('notifies removed items', async () => {
      const item = {
        id: 'item',
        progress: Progress.NotStarted,
        title: 'Get it done',
        type: ItemType.Task,
      }

      const cache = newCache()
      cache.cacheItem(CachedItem.item(item))

      let notifiedItems: ItemDTO[] = []
      cache.on(ItemCacheEvent.ItemsRemoved, items => {
        notifiedItems = items
      })

      await cache.fetchItems(undefined, [ ItemType.Task ])
      assert.include(notifiedItems.map(i => i.id), 'item')
    })

    it('does not notify when only updating items', async () => {
      const item1 = {
        id: 'item1',
        progress: Progress.NotStarted,
        title: 'New title',
        type: ItemType.Task,
      }
      backend.itemsToReturn = [ item1 ]

      const cache = newCache()
      cache.cacheItem(CachedItem.item({ ...item1, title: 'Old title' }))

      let isNotified = false
      cache.on(ItemCacheEvent.ItemsRemoved, () => { isNotified = true })

      await cache.fetchItems(undefined, [ ItemType.Task ])
      assert.isFalse(isNotified)
    })
  })

  function newCache() {
    return new ItemCache(backend)
  }
})
