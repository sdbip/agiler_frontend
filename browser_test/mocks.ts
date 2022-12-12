import { assert } from '@esm-bundle/chai'
import { ItemDTO, ItemType } from '../browser-src/backend/dtos'
import { Backend } from '../browser-src/item-cache'

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

  lastPromotedId?: string

  async promoteTask(id: string) {
    this.lastPromotedId = id
  }

  lastCompletedId?: string

  async completeTask(id: string) {
    this.lastCompletedId = id
  }
}
