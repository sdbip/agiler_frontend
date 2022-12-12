export enum ItemType {
  Epic = 'Epic',
  Feature = 'Feature',
  Story = 'Story',
  Task = 'Task'
}

export enum Progress {
  NotStarted = 'notStarted',
  Completed = 'completed'
}

export type ItemDTO = {
  id: string
  type: string
  title: string
  progress: string
  parentId?: string
}
