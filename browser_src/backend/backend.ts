import { ItemDTO, ItemType } from './dtos.js'

export class Fetcher {
  async fetch(url: URL | RequestInfo, init?: RequestInit): Promise<Response> {
    return await window.fetch(url, init)
  }
}

type Configuration = {
  get READ_MODEL_URL(): string
  get WRITE_MODEL_URL(): string
}

export class Backend {

  constructor(
    private readonly authenticatedUser: string,
    private readonly fetcher: Fetcher,
    private readonly env: Configuration) {
  }

  async fetchItem(id: string): Promise<ItemDTO | undefined> {
    const response = await this.fetcher.fetch(`${this.env.READ_MODEL_URL}/item/${id}`, {
      headers: {
        'Accept': 'application/json',
        ... this.authenticatedUser && { 'Authorization': this.authenticatedUser },
      },
    })
    if (!response.ok) throw new Error(`status ${response.status}\n${await response.text()}`)
    return await response.json()
  }

  async fetchItems(parentId: string | undefined, types: ItemType[]): Promise<ItemDTO[]> {
    const baseURL = parentId
      ? `${this.env.READ_MODEL_URL}/item/${parentId}/child`
      : `${this.env.READ_MODEL_URL}/item`
    const query = types.length ? `?type=${types.join('|')}` : ''
    const response = await this.fetcher.fetch(`${baseURL}${query}`, {
      headers: {
        'Accept': 'application/json',
        ... this.authenticatedUser && { 'Authorization': this.authenticatedUser },
      },
    })
    if (!response.ok) throw new Error(`status ${response.status}\n${await response.text()}`)
    return await response.json()
  }

  async addItem(title: string, type: ItemType, parentId: string | undefined): Promise<{ id: string }> {
    const url = parentId
      ? `${this.env.WRITE_MODEL_URL}/item/${parentId}/child`
      : `${this.env.WRITE_MODEL_URL}/item`

    const response = await this.fetcher.fetch(url, {
      method: 'POST',
      body: JSON.stringify({ title, type }),
      headers: {
        ... this.authenticatedUser && { 'Authorization': this.authenticatedUser },
        'Accept': 'application/json',
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
    if (!response.ok) throw new Error(`status ${response.status}\n${await response.text()}`)
    return await response.json()
  }

  async promoteTask(id: string): Promise<void> {
    const response = await this.fetcher.fetch(`${this.env.WRITE_MODEL_URL}/item/${id}/promote`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        ... this.authenticatedUser && { 'Authorization': this.authenticatedUser },
      },
    })
    if (!response.ok) throw new Error(`status ${response.status}\n${await response.text()}`)
  }

  async completeTask(id: string): Promise<void> {
    const response = await this.fetcher.fetch(`${this.env.WRITE_MODEL_URL}/item/${id}/complete`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        ... this.authenticatedUser && { 'Authorization': this.authenticatedUser },
      },
    })
    if (!response.ok) throw new Error(`status ${response.status}\n${await response.text()}`)
  }
}
