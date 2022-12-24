import { assert } from '@esm-bundle/chai'
import { ItemType, Progress } from '../browser_src/backend/dtos.js'
import { ItemCache } from '../browser_src/item-cache.js'
import { MockBackend } from './mocks'

describe(ItemCache.name, () => {

  describe('postItem', () => {

    const backend = new MockBackend()

    it('adds unverified item', async () => {
      const cache = newCache('temp_id')
      backend.idToReturn = 'id'

      /* do not await */ cache.addItem(ItemType.Feature, 'title', 'parent')
      assert.exists(cache.getCachedItem('temp_id'))
      assert.notExists(cache.getCachedItem('id'))
    })

    it('updates id when backend returns', async () => {
      const cache = newCache('temp_id')
      backend.idToReturn = 'id'

      await cache.addItem(ItemType.Feature, 'title', 'parent')
      assert.exists(cache.getCachedItem('id'))
      assert.notExists(cache.getCachedItem('temp_id'))
    })

    it('assumes details for an added item', async () => {
      const cache = newCache('temp_id')
      backend.idToReturn = 'id'

      /* do not await */ cache.addItem(ItemType.Feature, 'title', 'parent')

      assert.deepEqual(cache.getCachedItem('temp_id')?.item, {
        id: 'temp_id',
        parentId: 'parent',
        progress: Progress.NotStarted,
        title: 'title',
        type: ItemType.Feature,
      })
    })

    it('retains details after id is updated', async () => {
      const cache = newCache('temp_id')
      backend.idToReturn = 'id'

      const promise = cache.addItem(ItemType.Feature, 'title', 'parent')
      const initialItem = cache.getCachedItem('temp_id')
      await promise

      assert.deepEqual(cache.getCachedItem('id'), {
        unverified: initialItem?.unverified,
        item: {
          ...initialItem?.item,
          id: 'id'
        },
      })
    })

    it('sends the correct properties to the backend', async () => {
      const cache = newCache()
      await cache.addItem(ItemType.Feature, 'MMF Title', 'epic')

      assert.equal(backend.lastAddedParentId, 'epic')
      assert.equal(backend.lastAddedTitle, 'MMF Title')
      assert.equal(backend.lastAddedType, ItemType.Feature)
    })

    function newCache(nextTempId: string = 'some_id') {
      return new ItemCache(backend, { next: () => nextTempId })
    }
  })
})
