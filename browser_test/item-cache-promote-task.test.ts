import { assert } from '@esm-bundle/chai'
import { ItemDTO, ItemType, Progress } from '../browser_src/backend/dtos.js'
import { ItemCache, ItemCacheEvent } from '../browser_src/item-cache.js'
import { MockBackend } from './mocks'

describe(`${ItemCache.name}.promoteTask`, () => {

  const backend = new MockBackend()

  it('forwards to the backend', async () => {
    const cache = new ItemCache(backend)
    await cache.promoteTask('task')
    assert.equal(backend.lastPromotedId, 'task')
  })

  it('notifies that the item is now a Story', async () => {
    let notifiedItems: ItemDTO[] = []

    const cache = new ItemCache(backend)
    cache.cacheItem({
      id: 'task',
      progress: Progress.NotStarted,
      title: 'Promote Me',
      type: ItemType.Task,
    })
    cache.on(ItemCacheEvent.ItemsChanged, items => {
      notifiedItems = items
    })

    await cache.promoteTask('task')
    assert.deepEqual(notifiedItems.map(i => ({ id: i.id, type: i.type })), [ { id: 'task', type: ItemType.Story } ])
  })
})
