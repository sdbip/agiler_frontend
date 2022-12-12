import { ItemDTO, ItemType } from './dtos.js'
import * as env from './config.js'

export class Backend {
  async fetchItem(id: string): Promise<ItemDTO | undefined> {
    const response = await fetch(`${env.READ_MODEL_URL}/item/${id}`)
    if (!response.ok) throw new Error(`status ${response.status}\n${await response.text()}`)
    return await response.json()
  }

  async fetchItems(parentId: string | undefined, types: ItemType[]): Promise<ItemDTO[]> {
    const baseURL = parentId
      ? `${env.READ_MODEL_URL}/item/${parentId}/child`
      : `${env.READ_MODEL_URL}/item`
    const response = await fetch(`${baseURL}?type=${types.join('|')}`)
    if (!response.ok) throw new Error(`status ${response.status}\n${await response.text()}`)
    return await response.json()
  }

  async addItem(title: string, type: ItemType, parentId: string | undefined): Promise<{ id: string }> {
    const url = parentId
      ? `${env.WRITE_MODEL_URL}/item/${parentId}/child`
      : `${env.WRITE_MODEL_URL}/item`

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ title, type }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
    if (!response.ok) throw new Error(`status ${response.status}\n${await response.text()}`)
    return await response.json()
  }

  async promoteTask(id: string): Promise<void> {
    await fetch(`${env.WRITE_MODEL_URL}/item/${id}/promote`, { method: 'PATCH' })
  }

  async completeTask(id: string): Promise<void> {
    await fetch(`${env.WRITE_MODEL_URL}/item/${id}/complete`, { method: 'PATCH' })
  }
}
