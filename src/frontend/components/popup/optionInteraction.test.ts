import assert from 'node:assert/strict'
import test from 'node:test'
import { appendWithNewline, decideOptionInteraction, resolveOptionClickAction, shouldIgnoreCtrlAppend } from './optionInteraction.ts'

test('单击时应解析为 copy 动作', () => {
  const action = resolveOptionClickAction({ ctrlKey: false })
  assert.equal(action, 'copy')
})

test('Ctrl+单击时应解析为 append 动作', () => {
  const action = resolveOptionClickAction({ ctrlKey: true })
  assert.equal(action, 'append')
})

test('appendWithNewline 在空输入时直接写入文本', () => {
  const result = appendWithNewline('', '选项A')
  assert.equal(result, '选项A')
})

test('appendWithNewline 在非空输入时使用换行追加', () => {
  const result = appendWithNewline('已有内容', '选项A')
  assert.equal(result, '已有内容\n选项A')
})

test('appendWithNewline 支持连续追加顺序', () => {
  const first = appendWithNewline('', 'A')
  const second = appendWithNewline(first, 'B')
  assert.equal(second, 'A\nB')
})

test('Ctrl+追加遇到空文本应静默忽略', () => {
  const shouldIgnore = shouldIgnoreCtrlAppend('')
  assert.equal(shouldIgnore, true)
})

test('Ctrl+追加遇到非空文本不应忽略', () => {
  const shouldIgnore = shouldIgnoreCtrlAppend('选项A')
  assert.equal(shouldIgnore, false)
})

test('Ctrl+追加遇到空白文本（非空串）不应忽略', () => {
  const shouldIgnore = shouldIgnoreCtrlAppend('   ')
  assert.equal(shouldIgnore, false)
})

test('决策：普通点击应返回 copy 且不修改输入', () => {
  const decision = decideOptionInteraction('已有内容', '选项A', { ctrlKey: false })
  assert.equal(decision.action, 'copy')
  assert.equal(decision.nextInput, '已有内容')
  assert.equal(decision.copyText, '选项A')
  assert.equal(decision.shouldFocus, false)
})

test('决策：Ctrl+点击应返回 append 并更新输入', () => {
  const decision = decideOptionInteraction('已有内容', '选项A', { ctrlKey: true })
  assert.equal(decision.action, 'append')
  assert.equal(decision.nextInput, '已有内容\n选项A')
  assert.equal(decision.copyText, null)
  assert.equal(decision.shouldFocus, true)
})

test('决策：Ctrl+点击空文本应返回 noop', () => {
  const decision = decideOptionInteraction('已有内容', '', { ctrlKey: true })
  assert.equal(decision.action, 'noop')
  assert.equal(decision.nextInput, '已有内容')
  assert.equal(decision.copyText, null)
  assert.equal(decision.shouldFocus, false)
})
