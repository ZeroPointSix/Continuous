import assert from 'node:assert/strict'
import test from 'node:test'
import {
  COPY_FAILURE_MESSAGE,
  COPY_SUCCESS_MESSAGE,
  executeOptionInteraction,
  focusTextareaAtEnd,
} from './optionInteraction.ts'

function createFakeTextarea(initialValue: string) {
  let focused = false
  let selectionStart = -1
  let selectionEnd = -1

  const element = {
    value: initialValue,
    focus() {
      focused = true
    },
    setSelectionRange(start: number, end: number) {
      selectionStart = start
      selectionEnd = end
    },
  }

  return {
    element,
    get focused() {
      return focused
    },
    get selectionStart() {
      return selectionStart
    },
    get selectionEnd() {
      return selectionEnd
    },
  }
}

function createHarness(initialInput = '', initialSelectedOptions: string[] = ['已选项']) {
  let userInput = initialInput
  const selectedOptions = [...initialSelectedOptions]
  const clipboardWrites: string[] = []
  const successMessages: string[] = []
  const errorMessages: string[] = []
  let focusCallCount = 0
  const textarea = createFakeTextarea(initialInput)

  return {
    selectedOptions,
    clipboardWrites,
    successMessages,
    errorMessages,
    textarea,
    get userInput() {
      return userInput
    },
    get focusCallCount() {
      return focusCallCount
    },
    setInput(nextInput: string) {
      userInput = nextInput
      textarea.element.value = nextInput
    },
    async focusInputAtEnd() {
      focusCallCount += 1
      focusTextareaAtEnd(textarea.element)
    },
    notifyCopySuccess(message: string) {
      successMessages.push(message)
    },
    notifyCopyFailure(message: string) {
      errorMessages.push(message)
    },
  }
}

test('组件交互：click 复制成功', async () => {
  const harness = createHarness('已有内容')

  const result = await executeOptionInteraction({
    input: harness.userInput,
    optionText: '选项A',
    event: { ctrlKey: false },
    setInput: nextInput => harness.setInput(nextInput),
    focusInputAtEnd: () => harness.focusInputAtEnd(),
    copyToClipboard: async (text) => {
      harness.clipboardWrites.push(text)
    },
    notifyCopySuccess: message => harness.notifyCopySuccess(message),
    notifyCopyFailure: message => harness.notifyCopyFailure(message),
  })

  assert.equal(result.action, 'copy-success')
  assert.deepEqual(harness.clipboardWrites, ['选项A'])
  assert.equal(harness.userInput, '已有内容')
  assert.deepEqual(harness.successMessages, [COPY_SUCCESS_MESSAGE])
  assert.deepEqual(harness.errorMessages, [])
  assert.equal(harness.focusCallCount, 0)
})

test('组件交互：click 复制失败', async () => {
  const harness = createHarness('已有内容')

  const result = await executeOptionInteraction({
    input: harness.userInput,
    optionText: '选项A',
    event: { ctrlKey: false },
    setInput: nextInput => harness.setInput(nextInput),
    focusInputAtEnd: () => harness.focusInputAtEnd(),
    copyToClipboard: async () => {
      throw new Error('clipboard rejected')
    },
    notifyCopySuccess: message => harness.notifyCopySuccess(message),
    notifyCopyFailure: message => harness.notifyCopyFailure(message),
  })

  assert.equal(result.action, 'copy-failure')
  assert.equal(harness.userInput, '已有内容')
  assert.deepEqual(harness.successMessages, [])
  assert.deepEqual(harness.errorMessages, [COPY_FAILURE_MESSAGE])
  assert.equal(harness.focusCallCount, 0)
})

test('组件交互：ctrl+click 空输入直接追加', async () => {
  const harness = createHarness('')

  const result = await executeOptionInteraction({
    input: harness.userInput,
    optionText: '选项A',
    event: { ctrlKey: true },
    setInput: nextInput => harness.setInput(nextInput),
    focusInputAtEnd: () => harness.focusInputAtEnd(),
    copyToClipboard: async (text) => {
      harness.clipboardWrites.push(text)
    },
    notifyCopySuccess: message => harness.notifyCopySuccess(message),
    notifyCopyFailure: message => harness.notifyCopyFailure(message),
  })

  assert.equal(result.action, 'append')
  assert.equal(harness.userInput, '选项A')
  assert.equal(harness.focusCallCount, 1)
  assert.equal(harness.textarea.focused, true)
  assert.equal(harness.textarea.selectionStart, '选项A'.length)
  assert.equal(harness.textarea.selectionEnd, '选项A'.length)
  assert.deepEqual(harness.clipboardWrites, [])
})

test('组件交互：ctrl+click 非空输入换行追加并聚焦到末尾', async () => {
  const harness = createHarness('已有内容')

  const result = await executeOptionInteraction({
    input: harness.userInput,
    optionText: '选项A',
    event: { ctrlKey: true },
    setInput: nextInput => harness.setInput(nextInput),
    focusInputAtEnd: () => harness.focusInputAtEnd(),
    copyToClipboard: async (text) => {
      harness.clipboardWrites.push(text)
    },
    notifyCopySuccess: message => harness.notifyCopySuccess(message),
    notifyCopyFailure: message => harness.notifyCopyFailure(message),
  })

  assert.equal(result.action, 'append')
  assert.equal(harness.userInput, '已有内容\n选项A')
  assert.equal(harness.focusCallCount, 1)
  assert.equal(harness.textarea.focused, true)
  assert.equal(harness.textarea.selectionStart, harness.userInput.length)
  assert.equal(harness.textarea.selectionEnd, harness.userInput.length)
  assert.deepEqual(harness.successMessages, [])
  assert.deepEqual(harness.errorMessages, [])
})

test('组件交互：ctrl+click 空文本静默忽略', async () => {
  const harness = createHarness('已有内容')

  const result = await executeOptionInteraction({
    input: harness.userInput,
    optionText: '',
    event: { ctrlKey: true },
    setInput: nextInput => harness.setInput(nextInput),
    focusInputAtEnd: () => harness.focusInputAtEnd(),
    copyToClipboard: async (text) => {
      harness.clipboardWrites.push(text)
    },
    notifyCopySuccess: message => harness.notifyCopySuccess(message),
    notifyCopyFailure: message => harness.notifyCopyFailure(message),
  })

  assert.equal(result.action, 'noop')
  assert.equal(harness.userInput, '已有内容')
  assert.equal(harness.focusCallCount, 0)
  assert.deepEqual(harness.clipboardWrites, [])
  assert.deepEqual(harness.successMessages, [])
  assert.deepEqual(harness.errorMessages, [])
})

test('组件交互：单击复制不改变选中态', async () => {
  const harness = createHarness('已有内容', ['已选中A'])
  const selectedBefore = [...harness.selectedOptions]

  await executeOptionInteraction({
    input: harness.userInput,
    optionText: '选项A',
    event: { ctrlKey: false },
    setInput: nextInput => harness.setInput(nextInput),
    focusInputAtEnd: () => harness.focusInputAtEnd(),
    copyToClipboard: async (text) => {
      harness.clipboardWrites.push(text)
    },
    notifyCopySuccess: message => harness.notifyCopySuccess(message),
    notifyCopyFailure: message => harness.notifyCopyFailure(message),
  })

  assert.deepEqual(harness.selectedOptions, selectedBefore)
})
