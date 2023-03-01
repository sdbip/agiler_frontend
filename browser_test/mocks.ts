import { assert } from '@esm-bundle/chai'
import { ItemDTO, ItemType } from '../browser_src/backend/dtos.js'
import { Backend } from '../browser_src/item-cache.js'

export class MockBackend implements Backend {
  lastRequestedId?: string
  itemToReturn?: ItemDTO

  async fetchItem(id: string): Promise<ItemDTO | undefined> {
    this.lastRequestedId = id
    return this.itemToReturn
  }

  lastRequestedParentId?: string
  lastRequestedTypes?: ItemType[]
  itemsToReturn: ItemDTO[] = []

  async fetchItems(parentId: string | undefined, types: ItemType[]): Promise<ItemDTO[]> {
    this.lastRequestedParentId = parentId
    this.lastRequestedTypes = types
    return this.itemsToReturn
  }

  lastAddedTitle?: string
  lastAddedType?: ItemType
  lastAddedParentId?: string
  idToReturn?: string

  async addItem(title: string, type: ItemType, parentId: string | undefined) {
    const id = this.idToReturn
    if (!id) assert.fail('idToReturn not set up')
    this.lastAddedTitle = title
    this.lastAddedType = type
    this.lastAddedParentId = parentId
    return { id }
  }

  lastCompletedId?: string

  async completeTask(id: string) {
    this.lastCompletedId = id
  }
}
