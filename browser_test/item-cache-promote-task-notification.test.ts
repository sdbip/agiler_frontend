import { assert } from '@esm-bundle/chai'
import { ItemDTO, ItemType, Progress } from '../browser_src/backend/dtos.js'
import { CachedItem, ItemCache, ItemCacheEvent } from '../browser_src/item-cache.js'
import { MockBackend } from './mocks'

describe(`${ItemCache.name}.promoteTask`, () => {

  const backend = new MockBackend()

  it('forwards to the backend', async () => {
    const cache = newCache()
    await cache.promoteTask('task')
    assert.equal(backend.lastPromotedId, 'task')
  })

  it('immediately notifies that the item is now a Story', async () => {
    let notifiedItems: ItemDTO[] = []

    const cache = newCache()
    cache.cacheItem(CachedItem.item({
      id: 'task',
      progress: Progress.NotStarted,
      title: 'Promote Me',
      type: ItemType.Task,
    }))
    cache.on(ItemCacheEvent.ItemsChanged, items => {
      notifiedItems = items
    })

    /* do not await */ cache.promoteTask('task')
    assert.lengthOf(notifiedItems, 1)
    assert.equal(notifiedItems[0].id, 'task')
    assert.equal(notifiedItems[0].type, ItemType.Story)
  })

  function newCache() {
    return new ItemCache(backend)
  }
})
