import { assert } from '@esm-bundle/chai'
import { ItemType, Progress } from '../browser_src/backend/dtos.js'
import { CachedItem, ItemCache } from '../browser_src/item-cache.js'
import { MockBackend } from './mocks'

describe(`${ItemCache.name}.promoteTask`, () => {

  const backend = new MockBackend()

  it('forwards to the backend', async () => {
    const cache = newCache()
    await cache.promoteTask('task')
    assert.equal(backend.lastPromotedId, 'task')
  })

  it('updates the cached item without wait', async () => {
    const cache = newCache()
    cache.cacheItem(CachedItem.item({
      id: 'task',
      progress: Progress.NotStarted,
      title: 'Promote Me',
      type: ItemType.Task,
    }))

    /* do not await */ cache.promoteTask('task')
    assert.equal(cache.getCachedItem('task')?.item.type, ItemType.Story)
  })

  function newCache() {
    return new ItemCache(backend)
  }
})
