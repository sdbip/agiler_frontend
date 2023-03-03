import { ItemType } from '../backend/dtos.js'
import { ItemsPage } from './items-page.js'

(async () => {
  const page = new ItemsPage(ItemType.Task, ItemType.Story)
  await page.initialize()
})()
