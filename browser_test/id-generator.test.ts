import { assert } from '@esm-bundle/chai'
import { IDGenerator } from '../browser_src/id-generator'

describe(IDGenerator.name, () => {
  it('returns a value', () => {
    const generator = new IDGenerator()
    assert.exists(generator.next())
  })

  it('returns different values each time', () => {
    const generator = new IDGenerator()
    assert.notEqual(generator.next(), generator.next())
  })

  it('returns value on the form "new_#"', () => {
    const generator = new IDGenerator()
    assert.equal(generator.next(), 'new_1')
  })
})
