export type ClassName = { name: string }

export const ClassName = {
  default: { name: 'default' },
  disclosed: { name: 'disclosed' },
  hidden: { name: 'hidden' },
  inactive: { name: 'inactive' },
}

export type IdSelector = {
  id: string
}

export type ClassSelector = {
  className: ClassName
}

export type TagSelector = {
  tagName: string
}

export type Selector = ClassSelector | IdSelector | TagSelector

export const selector = (selector: Selector) =>
  'className' in selector
    ? `.${selector.className.name}`
    : 'id' in selector
      ? `#${selector.id}`
      : selector.tagName

export const toSelector = (string: string): Selector => {
  switch (string.charAt(0)) {
    case '#': return { id: string.substring(1) }
    case '.': return { className: { name: string.substring(1) } }
    default: return { tagName: string }
  }
}
