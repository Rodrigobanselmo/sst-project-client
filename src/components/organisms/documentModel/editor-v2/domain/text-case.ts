export const TEXT_CASE_LOCALE = 'pt-BR';

export type TextCaseMode = 'sentence' | 'lower' | 'upper' | 'title';

export type TextCaseStreamState = {
  capitalizeNext: boolean;
  wordStart: boolean;
  sawSentenceEnd: boolean;
};

export const CHANGE_CASE_MENU_ITEMS = [
  { mode: 'sentence' as const, label: 'Tipo de frase', shortcut: 'Shift+F3' },
  { mode: 'lower' as const, label: 'minúsculas', shortcut: 'Shift+F3' },
  { mode: 'upper' as const, label: 'MAIÚSCULAS', shortcut: 'Shift+F3' },
  { mode: 'title' as const, label: 'Iniciais Maiúsculas' },
] as const;

export const CHANGE_CASE_CYCLE_TOOLTIP = 'Alternar capitalização — Shift+F3';

export function createTextCaseStreamState(): TextCaseStreamState {
  return {
    capitalizeNext: true,
    wordStart: true,
    sawSentenceEnd: false,
  };
}

export function resetTextCaseBlockBoundary(
  state: TextCaseStreamState,
): TextCaseStreamState {
  return {
    ...state,
    capitalizeNext: true,
    wordStart: true,
    sawSentenceEnd: false,
  };
}

export function toLocaleLowerPtBr(text: string): string {
  return text.toLocaleLowerCase(TEXT_CASE_LOCALE);
}

export function toLocaleUpperPtBr(text: string): string {
  return text.toLocaleUpperCase(TEXT_CASE_LOCALE);
}

function isLetter(char: string): boolean {
  return /\p{L}/u.test(char);
}

function isWhitespace(char: string): boolean {
  return /\s/u.test(char);
}

function isSentenceTerminator(char: string): boolean {
  return char === '.' || char === '!' || char === '?';
}

function transformSentenceChunk(
  text: string,
  state: TextCaseStreamState,
): { text: string; state: TextCaseStreamState } {
  let capitalizeNext = state.capitalizeNext;
  let sawSentenceEnd = state.sawSentenceEnd;
  let output = '';

  for (const char of text) {
    if (isLetter(char)) {
      output += capitalizeNext
        ? char.toLocaleUpperCase(TEXT_CASE_LOCALE)
        : char.toLocaleLowerCase(TEXT_CASE_LOCALE);
      capitalizeNext = false;
      sawSentenceEnd = false;
      continue;
    }

    output += char;

    if (isSentenceTerminator(char)) {
      sawSentenceEnd = true;
      continue;
    }

    if (isWhitespace(char)) {
      if (sawSentenceEnd) capitalizeNext = true;
      continue;
    }

    sawSentenceEnd = false;
  }

  return {
    text: output,
    state: {
      ...state,
      capitalizeNext,
      sawSentenceEnd,
    },
  };
}

function transformTitleChunk(
  text: string,
  state: TextCaseStreamState,
): { text: string; state: TextCaseStreamState } {
  let wordStart = state.wordStart;
  let output = '';

  for (const char of text) {
    if (isWhitespace(char)) {
      wordStart = true;
      output += char;
      continue;
    }

    if (isLetter(char)) {
      output += wordStart
        ? char.toLocaleUpperCase(TEXT_CASE_LOCALE)
        : char.toLocaleLowerCase(TEXT_CASE_LOCALE);
      wordStart = false;
      continue;
    }

    output += char;
  }

  return {
    text: output,
    state: {
      ...state,
      wordStart,
    },
  };
}

export function transformTextCaseChunk(
  text: string,
  mode: TextCaseMode,
  state: TextCaseStreamState,
): { text: string; state: TextCaseStreamState } {
  if (mode === 'lower') {
    return { text: toLocaleLowerPtBr(text), state };
  }
  if (mode === 'upper') {
    return { text: toLocaleUpperPtBr(text), state };
  }
  if (mode === 'sentence') {
    return transformSentenceChunk(text, state);
  }
  return transformTitleChunk(text, state);
}

export function classifySelectedTextCase(
  text: string,
): 'upper' | 'lower' | 'mixed' {
  const upper = toLocaleUpperPtBr(text);
  const lower = toLocaleLowerPtBr(text);
  if (text === upper && text !== lower) return 'upper';
  if (text === lower && text !== upper) return 'lower';
  return 'mixed';
}

export function resolveShiftF3Mode(selectedText: string): TextCaseMode {
  const kind = classifySelectedTextCase(selectedText);
  if (kind === 'upper') return 'lower';
  if (kind === 'lower') return 'sentence';
  return 'upper';
}
