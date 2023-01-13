import { ItemType } from '../backend/dtos.js'
import { ItemsPage } from './items-page.js'

(async () => {
  const page = new ItemsPage(ItemType.Feature, ItemType.Epic)
  await page.initialize()
})()
