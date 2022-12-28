import { assert } from "@esm-bundle/chai"
import { Backend, Fetcher } from "../../browser_src/backend/backend.js"
import { ItemType } from "../../browser_src/backend/dtos.js"

class MockFetcher implements Fetcher {
  nextResponse?: unknown
  lastURL?: URL | RequestInfo
  lastRequestInit?: any

  async fetch(url: URL | RequestInfo, init?: RequestInit): Promise<Response> {
    this.lastURL = url
    this.lastRequestInit = init
    return this.nextResponse as Response
  }
}

const testConfig = {
  READ_MODEL_URL: 'read',
  WRITE_MODEL_URL: 'write',
}

describe(Backend.name, () => {

  let fetcher: MockFetcher
  let backend: Backend

  beforeEach(() => {
    fetcher = new MockFetcher()
    backend = new Backend('username', fetcher, testConfig)
  })

  describe('fetchItem (singular)', () => {

    it('throws if response status is not ok', async () => {
      fetcher.nextResponse = FAILURE_RESPONSE

      let didThrow = false
      try {
        await backend.fetchItem('id')
      } catch {
        didThrow = true
      }

      assert.isTrue(didThrow)
    })

    it('includes the id in the URL', () => {
      fetcher.nextResponse = SUCCESSFUL_RESPONSE

      backend.fetchItem('id')
      assert.equal(fetcher.lastURL, `${testConfig.READ_MODEL_URL}/item/id`)
    })

    it('includes authorization header', () => {
      fetcher.nextResponse = SUCCESSFUL_RESPONSE

      backend.fetchItem('id')

      assert.deepInclude(
        fetcher.lastRequestInit?.headers,
        { 'Authorization': 'username' })
    })

    it('returns the JSON data', async () => {
      fetcher.nextResponse = successfulResponse({})

      const item = await backend.fetchItem('id')
      assert.deepEqual(item, {} as unknown)
    })
  })

  describe('fetchItems (plural)', () => {

    it('throws if response status is not ok', async () => {
      fetcher.nextResponse = FAILURE_RESPONSE

      let didThrow = false
      try {
        await backend.fetchItems('', [])
      } catch {
        didThrow = true
      }

      assert.isTrue(didThrow)
    })

    it('calls the /item endpoint if no parent is specified', () => {
      fetcher.nextResponse = SUCCESSFUL_RESPONSE

      backend.fetchItems(undefined, [])

      assert.equal(fetcher.lastURL, 'read/item')
    })

    it('calls the /item/:parent/child endpoint if parent is specified', () => {
      fetcher.nextResponse = SUCCESSFUL_RESPONSE

      backend.fetchItems('parent', [])

      assert.equal(fetcher.lastURL, 'read/item/parent/child')
    })

    it('adds types to the /item endpoint', () => {
      fetcher.nextResponse = SUCCESSFUL_RESPONSE

      backend.fetchItems('parent', [ ItemType.Task, ItemType.Story ])

      assert.equal(fetcher.lastURL, 'read/item/parent/child?type=Task|Story')
    })

    it('adds types to the /item/:parent/child endpoint', () => {
      fetcher.nextResponse = SUCCESSFUL_RESPONSE

      backend.fetchItems(undefined, [ ItemType.Task, ItemType.Story ])

      assert.equal(fetcher.lastURL, 'read/item?type=Task|Story')
    })

    it('includes authorization header', () => {
      fetcher.nextResponse = SUCCESSFUL_RESPONSE

      backend.fetchItems(undefined, [])

      assert.deepInclude(
        fetcher.lastRequestInit?.headers,
        { 'Authorization': 'username' })
    })

    it('returns JSON data', async () => {
      fetcher.nextResponse = successfulResponse({})

      const result = await backend.fetchItems(undefined, [])

      assert.deepEqual(result, {} as any)
    })
  })

  describe('addItem', () => {

    it('throws if response status is not ok', async () => {
      fetcher.nextResponse = FAILURE_RESPONSE

      let didThrow = false
      try {
        await backend.addItem('', ItemType.Task, undefined)
      } catch {
        didThrow = true
      }

      assert.isTrue(didThrow)
    })

    it('calls the /item endpoint', () => {
      fetcher.nextResponse = SUCCESSFUL_RESPONSE

      backend.addItem('', ItemType.Task, undefined)

      assert.equal(fetcher.lastURL, 'write/item')
    })

    it('makes a POST request', () => {
      fetcher.nextResponse = SUCCESSFUL_RESPONSE

      backend.addItem('', ItemType.Task, undefined)

      assert.equal(fetcher.lastRequestInit?.method, 'POST')
    })

    it('sends the item data in the body', () => {
      fetcher.nextResponse = SUCCESSFUL_RESPONSE

      backend.addItem('', ItemType.Task, undefined)

      assert.deepEqual(fetcher.lastRequestInit?.body, '{"title":"","type":"Task"}')
    })

    it('includes headers', () => {
      fetcher.nextResponse = SUCCESSFUL_RESPONSE

      backend.addItem('', ItemType.Task, undefined)

      assert.deepEqual(fetcher.lastRequestInit?.headers, {
        'Authorization': 'username',
        'Content-type': 'application/json; charset=UTF-8',
      })
    })

    it('posts JSON data', async () => {
      fetcher.nextResponse = successfulResponse({})

      const result = await backend.addItem('', ItemType.Task, undefined)

      assert.deepEqual(result, {} as any)
    })

    it('returns JSON data', async () => {
      fetcher.nextResponse = successfulResponse({})

      const result = await backend.addItem('', ItemType.Task, undefined)

      assert.deepEqual(result, {} as any)
    })
  })

  describe('completeTask', () => {

    it('throws if response status is not ok', async () => {
      fetcher.nextResponse = FAILURE_RESPONSE

      let didThrow = false
      try {
        await backend.completeTask('id')
      } catch {
        didThrow = true
      }

      assert.isTrue(didThrow)
    })

    it('calls the /item/:id/complete endpoint', () => {
      fetcher.nextResponse = SUCCESSFUL_RESPONSE

      backend.completeTask('id')

      assert.equal(fetcher.lastURL, 'write/item/id/complete')
    })

    it('makes a PATCH request', () => {
      fetcher.nextResponse = SUCCESSFUL_RESPONSE

      backend.completeTask('id')

      assert.equal(fetcher.lastRequestInit?.method, 'PATCH')
    })

    it('includes authorization header', () => {
      fetcher.nextResponse = SUCCESSFUL_RESPONSE

      backend.completeTask('id')

      assert.deepInclude(
        fetcher.lastRequestInit?.headers,
        { 'Authorization': 'username' })
    })
  })

  describe('promoteTask', () => {

    it('throws if response status is not ok', async () => {
      fetcher.nextResponse = FAILURE_RESPONSE

      let didThrow = false
      try {
        await backend.promoteTask('id')
      } catch {
        didThrow = true
      }

      assert.isTrue(didThrow)
    })

    it('calls the /item/:id/promote endpoint', () => {
      fetcher.nextResponse = SUCCESSFUL_RESPONSE

      backend.promoteTask('id')

      assert.equal(fetcher.lastURL, 'write/item/id/promote')
    })

    it('makes a PATCH request', () => {
      fetcher.nextResponse = SUCCESSFUL_RESPONSE

      backend.promoteTask('id')

      assert.equal(fetcher.lastRequestInit?.method, 'PATCH')
    })

    it('includes authorization header', () => {
      fetcher.nextResponse = SUCCESSFUL_RESPONSE

      backend.promoteTask('id')

      assert.deepInclude(
        fetcher.lastRequestInit?.headers,
        { 'Authorization': 'username' })
    })
  })
})

const FAILURE_RESPONSE = { ok: false }
const SUCCESSFUL_RESPONSE = successfulResponse(null)

function successfulResponse(value: any) {
  return {
    ok: true,
    json: async () => value,
  }
}
