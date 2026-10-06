import { ParagraphEnum } from 'project/enum/paragraph.enum';

/**
 * Adaptador entre o array persistido (`texto{type}=TIPO`) e o documento visual.
 * O TipTap não é modelo de persistência: este módulo só fala em string[].
 */

const BOLD_DELIMITER = '**';
const SUPERSCRIPT_DELIMITER = '^^';
const TYPE_SUFFIX = /\{type\}=(PARAGRAPH|BULLET-[0-4])$/;

const KNOWN_TYPES = new Set<string>(Object.values(ParagraphEnum));

const CREATABLE_TYPES: ParagraphEnum[] = [
  ParagraphEnum.PARAGRAPH,
  ParagraphEnum.BULLET_0,
  ParagraphEnum.BULLET_1,
  ParagraphEnum.BULLET_2,
];

export type CharacterizationRun = {
  text: string;
  bold: boolean;
  superscript: boolean;
};

type ParsedItem = {
  type: ParagraphEnum;
  runs: CharacterizationRun[];
  opaque: boolean;
};

export type CharacterizationEditorNode = {
  type?: string;
  text?: string;
  attrs?: {
    blockType?: string | null;
    sourceItem?: string | null;
    synthetic?: boolean | null;
  };
  marks?: { type: string }[];
  content?: CharacterizationEditorNode[];
};

export type CharacterizationEditorDoc = {
  type?: string;
  content?: CharacterizationEditorNode[];
};

export function sameCharacterizationContent(
  left: string[],
  right: string[],
): boolean {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

function plainRun(text: string): CharacterizationRun {
  return { text, bold: false, superscript: false };
}

function splitEvenDelimiter(text: string, delimiter: string): string[] | null {
  if (!text.includes(delimiter)) return [text];
  const parts = text.split(delimiter);
  const delimiterCount = parts.length - 1;
  if (delimiterCount % 2 !== 0) return null;
  return parts;
}

function parseSuperscriptPieces(
  text: string,
  bold: boolean,
): CharacterizationRun[] | null {
  const parts = splitEvenDelimiter(text, SUPERSCRIPT_DELIMITER);
  if (!parts) return null;

  const runs: CharacterizationRun[] = [];
  parts.forEach((part, index) => {
    const superscript = index % 2 === 1;
    if (part.length === 0) {
      if (superscript) runs.push({ text: '', bold, superscript: true });
      return;
    }
    runs.push({ text: part, bold, superscript });
  });
  return runs;
}

export function textToRuns(text: string): CharacterizationRun[] {
  const literal = [plainRun(text)];
  const boldParts = splitEvenDelimiter(text, BOLD_DELIMITER);
  if (!boldParts) return literal;

  const runs: CharacterizationRun[] = [];
  let malformed = false;
  boldParts.forEach((part, index) => {
    if (malformed) return;
    const bold = index % 2 === 1;
    if (part.length === 0) {
      if (bold) runs.push({ text: '', bold: true, superscript: false });
      return;
    }
    const pieces = parseSuperscriptPieces(part, bold);
    if (!pieces) {
      malformed = true;
      return;
    }
    runs.push(...pieces);
  });

  if (malformed) return literal;
  const parsed = runs.length ? runs : [plainRun('')];
  if (runsToText(parsed) !== text) return literal;
  return parsed;
}

export function runsToText(runs: CharacterizationRun[]): string {
  return runs
    .map((run) => {
      const body = run.superscript
        ? `${SUPERSCRIPT_DELIMITER}${run.text}${SUPERSCRIPT_DELIMITER}`
        : run.text;
      return run.bold ? `${BOLD_DELIMITER}${body}${BOLD_DELIMITER}` : body;
    })
    .join('');
}

function mergeAdjacentRuns(runs: CharacterizationRun[]): CharacterizationRun[] {
  const merged: CharacterizationRun[] = [];
  runs.forEach((run) => {
    if (!run.text && !run.bold && !run.superscript) return;
    const previous = merged[merged.length - 1];
    if (
      previous &&
      previous.bold === run.bold &&
      previous.superscript === run.superscript
    ) {
      previous.text += run.text;
      return;
    }
    merged.push({ text: run.text, bold: run.bold, superscript: run.superscript });
  });
  return merged.length ? merged : [plainRun('')];
}

function textSignature(runs: CharacterizationRun[]): string {
  return runsToText(mergeAdjacentRuns(runs));
}

export function parseCharacterizationItem(raw: string): ParsedItem {
  const match = TYPE_SUFFIX.exec(raw);
  if (!match || !KNOWN_TYPES.has(match[1])) {
    return {
      type: ParagraphEnum.PARAGRAPH,
      runs: [plainRun(raw)],
      opaque: true,
    };
  }

  const text = raw.slice(0, match.index);
  const type = match[1] as ParagraphEnum;
  const runs = textToRuns(text);
  if (runsToText(runs) !== text) {
    return {
      type: ParagraphEnum.PARAGRAPH,
      runs: [plainRun(raw)],
      opaque: true,
    };
  }

  return { type, runs, opaque: false };
}

export function asParagraphType(value: unknown): ParagraphEnum {
  if (typeof value === 'string' && KNOWN_TYPES.has(value)) {
    return value as ParagraphEnum;
  }
  return ParagraphEnum.PARAGRAPH;
}

export function indentBlockType(
  type: ParagraphEnum,
  direction: 'in' | 'out',
): ParagraphEnum {
  if (type === ParagraphEnum.BULLET_3 || type === ParagraphEnum.BULLET_4) {
    if (direction === 'in') return type;
    return type === ParagraphEnum.BULLET_4
      ? ParagraphEnum.BULLET_3
      : ParagraphEnum.BULLET_2;
  }

  const index = CREATABLE_TYPES.indexOf(type);
  if (index < 0) return type;
  if (direction === 'in') {
    return CREATABLE_TYPES[Math.min(index + 1, CREATABLE_TYPES.length - 1)];
  }
  return CREATABLE_TYPES[Math.max(index - 1, 0)];
}

export function indentCharacterizationItem(
  raw: string,
  direction: 'in' | 'out',
): string {
  const parsed = parseCharacterizationItem(raw);
  if (parsed.opaque) return raw;
  const nextType = indentBlockType(parsed.type, direction);
  if (nextType === parsed.type) return raw;
  return `${runsToText(parsed.runs)}{type}=${nextType}`;
}

export function setCharacterizationItemType(
  raw: string,
  nextType: ParagraphEnum,
): string {
  const parsed = parseCharacterizationItem(raw);
  if (!parsed.opaque && parsed.type === nextType) return raw;
  if (parsed.opaque) return raw;
  return `${runsToText(parsed.runs)}{type}=${nextType}`;
}

function runsToChars(
  runs: CharacterizationRun[],
): { ch: string; bold: boolean; superscript: boolean }[] {
  const chars: { ch: string; bold: boolean; superscript: boolean }[] = [];
  runs.forEach((run) => {
    for (let index = 0; index < run.text.length; index += 1) {
      chars.push({
        ch: run.text[index],
        bold: run.bold,
        superscript: run.superscript,
      });
    }
  });
  return chars;
}

function charsToRuns(
  chars: { ch: string; bold: boolean; superscript: boolean }[],
): CharacterizationRun[] {
  const runs: CharacterizationRun[] = [];
  chars.forEach((char) => {
    const previous = runs[runs.length - 1];
    if (
      previous &&
      previous.bold === char.bold &&
      previous.superscript === char.superscript
    ) {
      previous.text += char.ch;
      return;
    }
    runs.push({
      text: char.ch,
      bold: char.bold,
      superscript: char.superscript,
    });
  });
  return runs.length ? runs : [plainRun('')];
}

/**
 * Índices no texto visual: `**` e `^^` válidos não entram na contagem.
 * Delimitadores incompletos permanecem como caracteres literais.
 */
function toggleMarkRange(
  raw: string,
  start: number,
  end: number,
  mark: 'bold' | 'superscript',
): string {
  if (start === end) return raw;
  const parsed = parseCharacterizationItem(raw);
  const from = Math.max(0, Math.min(start, end));
  const to = Math.max(start, end);
  const chars = runsToChars(parsed.runs);
  const slice = chars.slice(from, Math.min(to, chars.length));
  if (!slice.length) return raw;

  const enable = !slice.every((char) => char[mark]);
  for (let index = from; index < to && index < chars.length; index += 1) {
    chars[index][mark] = enable;
  }

  const text = runsToText(charsToRuns(chars));
  if (parsed.opaque) return text === raw ? raw : text;

  const suffix = `{type}=${parsed.type}`;
  const originalText = raw.endsWith(suffix) ? raw.slice(0, -suffix.length) : raw;
  if (text === originalText) return raw;
  return `${text}{type}=${parsed.type}`;
}

export function toggleBoldRange(raw: string, start: number, end: number): string {
  return toggleMarkRange(raw, start, end, 'bold');
}

export function toggleSuperscriptRange(
  raw: string,
  start: number,
  end: number,
): string {
  return toggleMarkRange(raw, start, end, 'superscript');
}

function runsToInline(runs: CharacterizationRun[]): CharacterizationEditorNode[] {
  const content: CharacterizationEditorNode[] = [];
  runs.forEach((run) => {
    if (run.bold && run.text.length === 0 && !run.superscript) {
      content.push({ type: 'text', text: BOLD_DELIMITER + BOLD_DELIMITER });
      return;
    }
    if (run.superscript && run.text.length === 0 && !run.bold) {
      content.push({
        type: 'text',
        text: SUPERSCRIPT_DELIMITER + SUPERSCRIPT_DELIMITER,
      });
      return;
    }
    const pieces = run.text.split('\n');
    pieces.forEach((piece, index) => {
      if (index > 0) content.push({ type: 'hardBreak' });
      if (!piece) return;
      const node: CharacterizationEditorNode = { type: 'text', text: piece };
      const marks: { type: string }[] = [];
      if (run.bold) marks.push({ type: 'bold' });
      if (run.superscript) marks.push({ type: 'superscript' });
      if (marks.length) node.marks = marks;
      content.push(node);
    });
  });
  return content;
}

function inlineToRuns(
  content: CharacterizationEditorNode[] | undefined,
): CharacterizationRun[] {
  if (!content?.length) return [plainRun('')];

  const runs: CharacterizationRun[] = [];
  let activeBold = false;
  let activeSuperscript = false;
  const push = (text: string, bold: boolean, superscript: boolean) => {
    if (!text) return;
    const previous = runs[runs.length - 1];
    if (previous && previous.bold === bold && previous.superscript === superscript) {
      previous.text += text;
      return;
    }
    runs.push({ text, bold, superscript });
  };

  content.forEach((node) => {
    if (node.type === 'hardBreak') {
      push('\n', activeBold, activeSuperscript);
      return;
    }
    if (node.type !== 'text') return;
    activeBold = Boolean(node.marks?.some((mark) => mark.type === 'bold'));
    activeSuperscript = Boolean(
      node.marks?.some((mark) => mark.type === 'superscript'),
    );
    push(node.text || '', activeBold, activeSuperscript);
  });

  return runs.length ? runs : [plainRun('')];
}

function paragraphNode(
  raw: string | null,
  parsed: ParsedItem,
  synthetic: boolean,
): CharacterizationEditorNode {
  const inline = runsToInline(
    parsed.opaque ? [plainRun(raw || '')] : parsed.runs,
  );
  const node: CharacterizationEditorNode = {
    type: 'paragraph',
    attrs: {
      blockType: parsed.opaque ? ParagraphEnum.PARAGRAPH : parsed.type,
      sourceItem: raw,
      synthetic,
    },
  };
  if (inline.length) node.content = inline;
  return node;
}

export function characterizationContentToTiptap(
  values: string[],
): CharacterizationEditorDoc {
  if (!values.length) {
    return {
      type: 'doc',
      content: [
        paragraphNode(
          null,
          {
            type: ParagraphEnum.PARAGRAPH,
            runs: [plainRun('')],
            opaque: false,
          },
          true,
        ),
      ],
    };
  }

  return {
    type: 'doc',
    content: values.map((raw) =>
      paragraphNode(raw, parseCharacterizationItem(raw), false),
    ),
  };
}

function paragraphToItem(node: CharacterizationEditorNode): string | null {
  const type = asParagraphType(node.attrs?.blockType);
  const runs = inlineToRuns(node.content);
  const source =
    typeof node.attrs?.sourceItem === 'string' ? node.attrs.sourceItem : null;
  const synthetic = node.attrs?.synthetic === true;
  const currentText = textSignature(runs);

  if (source != null) {
    const parsed = parseCharacterizationItem(source);
    if (parsed.opaque) {
      if (currentText === source && type === ParagraphEnum.PARAGRAPH) return source;
    } else if (currentText === textSignature(parsed.runs)) {
      if (type === parsed.type) return source;
      const suffix = `{type}=${parsed.type}`;
      const originalText = source.endsWith(suffix)
        ? source.slice(0, -suffix.length)
        : textSignature(parsed.runs);
      return `${originalText}{type}=${type}`;
    }
  }

  if (synthetic && currentText === '' && type === ParagraphEnum.PARAGRAPH) {
    return null;
  }

  return `${currentText}{type}=${type}`;
}

export function tiptapToCharacterizationContent(
  doc: CharacterizationEditorDoc,
): string[] {
  const items: string[] = [];
  (doc.content || []).forEach((node) => {
    if (node.type !== 'paragraph') {
      const text = collectPlainText(node);
      if (text) items.push(`${text}{type}=${ParagraphEnum.PARAGRAPH}`);
      return;
    }
    const item = paragraphToItem(node);
    if (item != null) items.push(item);
  });
  return items;
}

function collectPlainText(node: CharacterizationEditorNode): string {
  if (node.type === 'text') return node.text || '';
  if (node.type === 'hardBreak') return '\n';
  return (node.content || []).map((child) => collectPlainText(child)).join('');
}

export function roundTripCharacterizationContent(values: string[]): string[] {
  return tiptapToCharacterizationContent(characterizationContentToTiptap(values));
}
