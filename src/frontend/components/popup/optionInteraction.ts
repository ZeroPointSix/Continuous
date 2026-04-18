export type OptionClickAction = 'copy' | 'append'

export const COPY_SUCCESS_MESSAGE = '已复制'
export const COPY_FAILURE_MESSAGE = '复制失败，请手动复制'

export type OptionInteractionDecision =
  | { action: 'copy', nextInput: string, copyText: string, shouldFocus: false }
  | { action: 'append', nextInput: string, copyText: null, shouldFocus: true }
  | { action: 'noop', nextInput: string, copyText: null, shouldFocus: false }

export interface ExecuteOptionInteractionContext {
  input: string
  optionText: string
  event: Pick<MouseEvent, 'ctrlKey'>
  setInput: (nextInput: string) => void
  focusInputAtEnd: () => Promise<void> | void
  copyToClipboard: (text: string) => Promise<void>
  notifyCopySuccess: (message: string) => void
  notifyCopyFailure: (message: string) => void
}

export type ExecuteOptionInteractionResult
  = | { action: 'append', nextInput: string }
    | { action: 'noop', nextInput: string }
    | { action: 'copy-success', nextInput: string }
    | { action: 'copy-failure', nextInput: string, error: unknown }

/**
 * 解析预定义选项点击动作。
 * 当前版本仅支持 Ctrl+Click 触发追加，普通点击触发复制。
 */
export function resolveOptionClickAction(event: Pick<MouseEvent, 'ctrlKey'>): OptionClickAction {
  return event.ctrlKey ? 'append' : 'copy'
}

/**
 * 按产品规则进行换行追加。
 */
export function appendWithNewline(input: string, optionText: string): string {
  if (input.length === 0) {
    return optionText
  }
  return `${input}\n${optionText}`
}

/**
 * Ctrl+追加时，空文本直接忽略（静默）。
 */
export function shouldIgnoreCtrlAppend(optionText: string): boolean {
  return optionText.length === 0
}

/**
 * 基于当前输入、选项文本与点击事件，决策本次交互行为。
 * - 普通点击：copy（输入不变）
 * - Ctrl+点击：append（空文本则 noop）
 */
export function decideOptionInteraction(
  input: string,
  optionText: string,
  event: Pick<MouseEvent, 'ctrlKey'>,
): OptionInteractionDecision {
  const action = resolveOptionClickAction(event)

  if (action === 'copy') {
    return {
      action: 'copy',
      nextInput: input,
      copyText: optionText,
      shouldFocus: false,
    }
  }

  if (shouldIgnoreCtrlAppend(optionText)) {
    return {
      action: 'noop',
      nextInput: input,
      copyText: null,
      shouldFocus: false,
    }
  }

  return {
    action: 'append',
    nextInput: appendWithNewline(input, optionText),
    copyText: null,
    shouldFocus: true,
  }
}

export function focusTextareaAtEnd(
  inputElement: Pick<HTMLTextAreaElement, 'focus' | 'value' | 'setSelectionRange'> | null | undefined,
): boolean {
  if (!inputElement) {
    return false
  }

  inputElement.focus()
  const textLength = inputElement.value.length
  if (typeof inputElement.setSelectionRange === 'function') {
    inputElement.setSelectionRange(textLength, textLength)
  }

  return true
}

export async function executeOptionInteraction(
  context: ExecuteOptionInteractionContext,
): Promise<ExecuteOptionInteractionResult> {
  const decision = decideOptionInteraction(context.input, context.optionText, context.event)

  if (decision.action === 'noop') {
    return {
      action: 'noop',
      nextInput: decision.nextInput,
    }
  }

  if (decision.action === 'append') {
    context.setInput(decision.nextInput)
    if (decision.shouldFocus) {
      await context.focusInputAtEnd()
    }

    return {
      action: 'append',
      nextInput: decision.nextInput,
    }
  }

  try {
    await context.copyToClipboard(decision.copyText)
    context.notifyCopySuccess(COPY_SUCCESS_MESSAGE)
    return {
      action: 'copy-success',
      nextInput: decision.nextInput,
    }
  }
  catch (error) {
    context.notifyCopyFailure(COPY_FAILURE_MESSAGE)
    return {
      action: 'copy-failure',
      nextInput: decision.nextInput,
      error,
    }
  }
}
