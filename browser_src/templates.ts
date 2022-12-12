import Mustache from 'mustache'

let baseURL = ''

export const setBaseURL = (url: string) => {
  baseURL = url
}

export async function render(templateName: string, viewModel: object) {
  const template = await loadFile(pathForTemplate(templateName))
  return Mustache.render(template, viewModel)
}

const pathForTemplate = (name: string): string =>
  `${baseURL}/public/templates/${name}.mustache`

async function loadFile(path: string) {
  const response = await fetch(path)
  return await response.text()
}
