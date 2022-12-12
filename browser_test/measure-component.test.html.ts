import { runTests } from '@web/test-runner-mocha'
import { assert } from '@esm-bundle/chai'
import { MeasureComponent } from '../browser_src/measure-component.js'

runTests(() => {
  it('measures explicitly sized element to its parameters', () => {
    assert.deepEqual(
      MeasureComponent.instance.measure('<div style="height: 10px; width: 15px"></div>'),
      { height: 10, width: 15 })
  })

  it('measures unsized element to its content', () => {
    assert.deepEqual(
      MeasureComponent.instance.measure('<div><div style="height: 10px; width: 15px"></div></div>'),
      { height: 10, width: 15 })
  })

  it('wraps long text when restricted by width', () => {
    const size = MeasureComponent.instance.measure('<div>This is a pretty long text. It should be wrapped.</div>', 100)
    assert.isAtMost(size.width, 100)
    assert.isAbove(size.height, 40)
  })

  it('does not wrap text when width is unrestricted', () => {
    const size = MeasureComponent.instance.measure('<div>This is a pretty long text. It should be wrapped.</div>')
    assert.isBelow(size.height, 20)
    assert.isAbove(size.width, 200)
  })

  it('removes content after measuring', () => {
    MeasureComponent.instance.measure('<div></div>')
    assert.equal(MeasureComponent.instance.element.innerHTML, '')
  })
})
