import { assert } from '@esm-bundle/chai'
import { ItemDTO, ItemType, Progress } from '../browser_src/backend/dtos.js'
import { CachedItem, ItemCache, ItemCacheEvent } from '../browser_src/item-cache.js'
import { MockBackend } from './mocks'

describe(`${ItemCache.name}.completeTask`, () => {

  const backend = new MockBackend()

  it('forwards to the backend', async () => {
    const cache = newCache()
    await cache.completeTask('task')
    assert.equal(backend.lastCompletedId, 'task')
  })

  it('notifies that the item is now a Story', async () => {
    let notifiedItems: ItemDTO[] = []

    const cache = newCache()
    cache.cacheItem(CachedItem.item({
      id: 'task',
      progress: Progress.NotStarted,
      title: 'Complete Me',
      type: ItemType.Task,
    }))
    cache.on(ItemCacheEvent.ItemsChanged, items => {
      notifiedItems = items
    })

    await cache.completeTask('task')
    assert.deepEqual(notifiedItems.map(i => ({ id: i.id, progress: i.progress })), [ { id: 'task', progress: Progress.Completed } ])
  })

  function newCache() {
    return new ItemCache(backend, () => 'some_id')
  }
})
