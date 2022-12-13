import { runTests } from '@web/test-runner-mocha'
import { assert } from '@esm-bundle/chai'
import { ItemComponent } from '../browser_src/item-component.js'
import { render, setBaseURL } from '../browser_src/templates.js'
import { PageComponent } from '../browser_src/page-component.js'
import { ClassName } from '../browser_src/class-name.js'
import { DOMElement } from '../browser_src/dom-element.js'

runTests(() => {
  before(async () => {
    setBaseURL('../dist')
    await renderPageComponent()
    await renderItems([
      {
        id: 'story',
        progress: 'notStarted',
        title: 'Finish story',
        type: 'Story',
      },
      {
        id: 'task',
        progress: 'notStarted',
        title: 'Perform task',
        type: 'Task',
      },
    ])
  })

  it('finds itself', () => {
    assert.exists(ItemComponent.forId('task'))
    assert.exists(ItemComponent.forId('story'))
    assert.notExists(ItemComponent.forId('subtask'))
  })

  it('has no parent component', () => {
    assert.notExists(ItemComponent.forId('story')?.parentComponent)
    assert.notExists(ItemComponent.forId('task')?.parentComponent)
  })

  it('knows item id', () => {
    assert.equal(ItemComponent.forId('story')?.itemId, 'story')
    assert.equal(ItemComponent.forId('task')?.itemId, 'task')
  })

  describe('Story component', () => {
    let storyElement: HTMLDivElement
    let titleInputElement: HTMLInputElement
    let itemListElement: HTMLDivElement
    let collapsibleElement: HTMLDivElement

    let storyComponent: ItemComponent
    let addButtonElement: DOMElement
    let spinnerElement: DOMElement

    before(() => {
      storyElement = getElementById('item-story')
      titleInputElement = getElementByClassName(storyElement, 'item-title')
      assert.exists(titleInputElement, 'titleInputElement')

      collapsibleElement = getElementByClassName(storyElement, 'collapsible')
      assert.exists(collapsibleElement, 'collapsibleElement')

      itemListElement = getElementByClassName(storyElement, 'item-list')
      assert.exists(itemListElement, 'itemListElement')

      storyComponent = ItemComponent.forId('story') as ItemComponent
      assert.exists(storyComponent, 'storyComponent')

      addButtonElement = storyComponent?.element.decendants({ className: { name: 'add-button' } })[0] as DOMElement
      assert.exists(addButtonElement, 'addButtonElement')

      spinnerElement = storyComponent?.element.decendants({ className: { name: 'spinner' } })[0] as DOMElement
      assert.exists(spinnerElement, 'spinnerElement')
    })

    it('gets its title from the title element', () => {
      titleInputElement.value = 'This is a title'
      assert.equal(storyComponent?.title, 'This is a title')
    })

    describe('add-button styling', () => {

      describe('when not highlighted', () => {

        beforeEach(() => {
          titleInputElement.value = 'not empty'
          addButtonElement.removeClass(ClassName.default)
        })

        it('highlights add-button when receiving focus event', () => {
          storyComponent.handleUIEvent('focus', undefined)
          assert.isTrue(addButtonElement.hasClass(ClassName.default))
        })

        it('highlights add-button when receiving input event', () => {
          storyComponent.handleUIEvent('input', undefined)
          assert.isTrue(addButtonElement.hasClass(ClassName.default))
        })

        it('does not highlight button if title is empty', () => {
          titleInputElement.value = ''
          storyComponent.handleUIEvent('focus', undefined)
          storyComponent.handleUIEvent('input', undefined)
          assert.isFalse(addButtonElement.hasClass(ClassName.default))
        })
      })

      describe('when highlighted', () => {

        beforeEach(() => {
          addButtonElement.removeClass(ClassName.default)
        })

        it('unhighlights button if title becomes empty', () => {
          titleInputElement.value = ''

          storyComponent?.handleUIEvent('input', undefined)
          assert.isFalse(addButtonElement.hasClass(ClassName.default))
        })

        it('unhighlights button when receiving blur event', () => {
          titleInputElement.value = 'not empty'

          storyComponent?.handleUIEvent('blur', undefined)
          assert.isFalse(addButtonElement.hasClass(ClassName.default))
        })
      })
    })

    describe('rendering', () => {

      beforeEach(() => {
        itemListElement.innerHTML = ''
      })

      it('adds item-components when receiving tasks', async () => {
        // NOTE: Cannot refer to ItemType or Progress here.
        // It freezes the test for unknown reason.
        const items = [
          {
            id: 'subtask',
            type: 'Task',
            title: 'a task',
            progress: 'notStarted',
          },
        ]

        // TODO: This waits for a .5s animation
        await storyComponent.handleUIEvent('items_added', { items })
        assert.exists(ItemComponent.forId('subtask'), 'sutask component should exist after adding items')
        assert.equal(itemListElement.childElementCount, 1)
      })

      it('starts the spinner', () => {
        spinnerElement.addClass(ClassName.inactive)
        storyComponent.handleUIEvent('loading')
        assert.isFalse(spinnerElement.hasClass(ClassName.inactive))
      })

      it('stops the spinner', () => {
        spinnerElement.removeClass(ClassName.inactive)
        storyComponent.handleUIEvent('loading-done')
        assert.isTrue(spinnerElement.hasClass(ClassName.inactive))
      })

      it('styles element when disclosing subtasks', () => {
        storyComponent.element.removeClass(ClassName.disclosed)
        storyComponent.handleUIEvent('disclose')
        assert.isTrue(storyComponent.element.hasClass(ClassName.disclosed))
      })

      it('styles element when collapsing the subtasks', () => {
        storyComponent.element.addClass(ClassName.disclosed)
        storyComponent.handleUIEvent('collapse')
        assert.isFalse(storyComponent.element.hasClass(ClassName.disclosed))
      })

      it('discloses collapsible pane', () => {
        collapsibleElement.style.height = '0'
        storyComponent.handleUIEvent('disclose')
        assert.equal(collapsibleElement.style.height, '28px')
      })

      it('collapses the collapsible pane', () => {
        collapsibleElement.style.height = '43px'
        storyComponent.handleUIEvent('collapse')
        assert.equal(collapsibleElement.style.height, '0px')
      })
    })
  })

  describe('Subtask component', () => {
    before(async () => {
      const storyComponent = ItemComponent.forId('story')
      await storyComponent?.handleUIEvent('items_added', { items: [ {
        id: 'subtask',
        progress: 'notStarted',
        title: 'Perform subtask',
        type: 'Task',
      } as any ] })
    })

    it('finds itself', () => {
      assert.exists(ItemComponent.forId('subtask'))
    })

    it('finds parent component', () => {
      assert.exists(ItemComponent.forId('subtask')?.parentComponent)
    })
  })
})

function getElementByClassName<T extends HTMLElement>(itemElement: HTMLElement, className: string): T {
  return itemElement.getElementsByClassName(className)[0] as T
}

function getElementById<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T
}

async function renderPageComponent() {
  const html = await render('page-component', {})
  document.body.innerHTML = html
}

async function renderItems(items: any[]) {
  // TODO: This waits for a .5s animation
  await PageComponent.instance.handleUIEvent('items_added', { items })
}
