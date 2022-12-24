import { assert } from '@esm-bundle/chai'
import { ItemDTO, ItemType, Progress } from '../browser_src/backend/dtos.js'
import { CachedItem, ItemCache, ItemCacheEvent } from '../browser_src/item-cache.js'
import { MockBackend } from './mocks'

describe(ItemCache.name, () => {

  describe('postItem', () => {

    const backend = new MockBackend()

    it('assumes details for an added item', async () => {
      let notifiedItems: ItemDTO[] = []

      backend.idToReturn = 'id'

      const cache = newCache('temp_id')
      cache.on(ItemCacheEvent.ItemsAdded, (items) => {
        notifiedItems = items
      })

      cache.addItem(ItemType.Feature, 'title', 'parent')

      assert.deepEqual(notifiedItems, [ {
        id: 'temp_id',
        parentId: 'parent',
        progress: Progress.NotStarted,
        title: 'title',
        type: ItemType.Feature,
      } ])
    })

    it('notifies the returned id', async () => {
      let notifiedItems: ItemDTO[] = []

      backend.idToReturn = 'id'

      const cache = newCache('temp_id')
      cache.on(ItemCacheEvent.IdChanged, (items) => {
        notifiedItems = items
      })

      await cache.addItem(ItemType.Feature, 'title', 'parent')

      assert.deepEqual(notifiedItems[0] as any, {
        id: 'temp_id',
        newId: 'id',
        parentId: 'parent',
        progress: Progress.NotStarted,
        title: 'title',
        type: ItemType.Feature,
      })
    })

    it('notifies if the parent changed', async () => {
      let notifiedItems: ItemDTO[] = []

      backend.idToReturn = 'id'

      const cache = newCache()
      cache.cacheItem(CachedItem.item({
        id: 'epic',
        progress: Progress.NotStarted,
        title: 'Epic Feature',
        type: ItemType.Feature,
      }))
      cache.on(ItemCacheEvent.ItemsChanged, (items) => {
        notifiedItems = items
      })

      await cache.addItem(ItemType.Feature, 'MMF Title', 'epic')

      assert.deepEqual(notifiedItems, [ {
        id: 'epic',
        progress: Progress.NotStarted,
        title: 'Epic Feature',
        type: ItemType.Epic,
      } ])
    })

    it('sends the correct properties to the backend', async () => {
      backend.idToReturn = 'id'

      const cache = newCache()
      await cache.addItem(ItemType.Feature, 'MMF Title', 'epic')

      assert.equal(backend.lastAddedParentId, 'epic')
      assert.equal(backend.lastAddedTitle, 'MMF Title')
      assert.equal(backend.lastAddedType, ItemType.Feature)
    })

    it('triggers changed event if backend stores other data', async () => {
      backend.idToReturn = 'id'
      backend.itemsToReturn = [ {
        id: 'id',
        progress: Progress.NotStarted,
        title: '',
        type: ItemType.Feature,
      } ]

      let notifiedItems: ItemDTO[] = []

      const cache = newCache()
      cache.on(ItemCacheEvent.ItemsChanged, (items) => {
        notifiedItems = items
      })

      await cache.addItem(ItemType.Feature, 'Feature Title')
      await cache.fetchItems(undefined, [ ItemType.Feature ])

      assert.lengthOf(notifiedItems, 1)
    })

    it('triggers removed event if backend removes it', async () => {
      backend.idToReturn = 'id'
      let notifiedItems: ItemDTO[] = []

      const cache = newCache()
      cache.on(ItemCacheEvent.ItemsRemoved, (items) => {
        notifiedItems = items
      })

      await cache.addItem(ItemType.Feature, 'Feature Title')

      backend.itemsToReturn = [ {
        id: 'id',
        progress: Progress.NotStarted,
        title: '',
        type: ItemType.Feature,
      } ]
      await cache.fetchItems(undefined, [ ItemType.Feature ])

      backend.itemsToReturn = []
      await cache.fetchItems(undefined, [ ItemType.Feature ])

      assert.lengthOf(notifiedItems, 1)
    })

    it('does not trigger removed event if it has not yet appeared in the read model', async () => {
      backend.idToReturn = 'id'
      backend.itemsToReturn = []

      const cache = newCache()
      cache.on(ItemCacheEvent.ItemsRemoved, () => {
        assert.fail('Item should not be removed if it is not yet known to exist')
      })

      await cache.addItem(ItemType.Feature, 'Feature Title')
      await cache.fetchItems(undefined, [ ItemType.Feature ])
    })

    it('marks the item so it is not notified as removed', async () => {
      let notifiedItems: ItemDTO[] = []

      backend.idToReturn = 'id'
      backend.itemsToReturn = []

      const cache = newCache()
      cache.on(ItemCacheEvent.ItemsRemoved, (items) => {
        notifiedItems = items
      })

      await cache.addItem(ItemType.Task, 'Title')
      await cache.fetchItems(undefined, [ ItemType.Task ])

      assert.lengthOf(notifiedItems, 0)
    })

    function newCache(nextTempId: string = 'some_id') {
      return new ItemCache(backend, { next: () => nextTempId })
    }
  })
})
