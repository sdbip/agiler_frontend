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

  it('updates the cached item without wait', async () => {
    const cache = newCache()
    cache.cacheItem(CachedItem.item({
      id: 'task',
      progress: Progress.NotStarted,
      title: 'Complete Me',
      type: ItemType.Task,
    }))

    /* do not await */ cache.completeTask('task')
    assert.equal(cache.getCachedItem('task')?.item.progress, Progress.Completed)
  })

  function newCache() {
    return new ItemCache(backend, () => 'some_id')
  }
})
