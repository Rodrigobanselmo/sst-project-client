import {
  IEntityRange,
  IInlineStyleRange,
} from 'core/interfaces/api/IDocumentModel';

export type VariableTokenSpan = {
  start: number;
  end: number;
  token: string;
};

const VARIABLE_TOKEN = /\?\?[^?\n]+\?\?/g;

export function findVariableTokens(text: string): VariableTokenSpan[] {
  const spans: VariableTokenSpan[] = [];
  const matcher = new RegExp(VARIABLE_TOKEN.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = matcher.exec(text))) {
    spans.push({
      start: match.index,
      end: match.index + match[0].length,
      token: match[0],
    });
  }
  return spans;
}

/** Split inside `??VAR??` jumps to after the token so the canonical token stays intact. */
export function snapSplitOffset(text: string, offset: number): number {
  const clamped = Math.max(0, Math.min(text.length, offset));
  for (const span of findVariableTokens(text)) {
    if (clamped > span.start && clamped < span.end) return span.end;
  }
  return clamped;
}

function lineStarts(text: string): number[] {
  const lines = text.split('\n');
  const starts: number[] = [];
  let abs = 0;
  lines.forEach((line, index) => {
    starts.push(abs);
    abs += line.length + (index < lines.length - 1 ? 1 : 0);
  });
  return starts;
}

function flattenRangeBlock<T extends { offset: number; length: number }>(
  text: string,
  block?: T[][],
): T[] {
  const starts = lineStarts(text);
  const flat: T[] = [];
  (block || []).forEach((lineRanges, lineIndex) => {
    const base = starts[lineIndex] ?? 0;
    (lineRanges || []).forEach((range) => {
      flat.push({ ...range, offset: range.offset + base });
    });
  });
  return flat;
}

function unflattenRangeBlock<T extends { offset: number; length: number }>(
  text: string,
  flat: T[],
): T[][] {
  const lines = text.split('\n');
  const starts = lineStarts(text);
  const block: T[][] = lines.map(() => []);

  flat.forEach((range) => {
    for (let index = starts.length - 1; index >= 0; index -= 1) {
      if (range.offset < starts[index]) continue;
      const local = range.offset - starts[index];
      const lineLength = lines[index].length;
      if (local >= lineLength) break;
      const length = Math.min(range.length, lineLength - local);
      if (length > 0) {
        block[index].push({ ...range, offset: local, length });
      }
      break;
    }
  });

  return block;
}

function clipFlatRanges<T extends { offset: number; length: number }>(
  flat: T[],
  start: number,
  end: number,
): T[] {
  const clipped: T[] = [];
  flat.forEach((range) => {
    const rangeEnd = range.offset + range.length;
    const nextStart = Math.max(range.offset, start);
    const nextEnd = Math.min(rangeEnd, end);
    if (nextEnd > nextStart) {
      clipped.push({
        ...range,
        offset: nextStart - start,
        length: nextEnd - nextStart,
      });
    }
  });
  return clipped;
}

export type SplitTextResult = {
  text: string;
  inlineStyleRangeBlock: IInlineStyleRange[][];
  entityRangeBlock: IEntityRange[][];
};

export function splitTextAndRanges(
  text: string,
  inlineStyleRangeBlock: IInlineStyleRange[][] | undefined,
  entityRangeBlock: IEntityRange[][] | undefined,
  offset: number,
): { before: SplitTextResult; after: SplitTextResult } {
  const snapped = snapSplitOffset(text ?? '', offset);
  const source = text ?? '';
  const beforeText = source.slice(0, snapped);
  const afterText = source.slice(snapped);

  const styles = flattenRangeBlock(source, inlineStyleRangeBlock);
  const entities = flattenRangeBlock(source, entityRangeBlock);

  return {
    before: {
      text: beforeText,
      inlineStyleRangeBlock: unflattenRangeBlock(
        beforeText,
        clipFlatRanges(styles, 0, snapped),
      ),
      entityRangeBlock: unflattenRangeBlock(
        beforeText,
        clipFlatRanges(entities, 0, snapped),
      ),
    },
    after: {
      text: afterText,
      inlineStyleRangeBlock: unflattenRangeBlock(
        afterText,
        clipFlatRanges(styles, snapped, source.length),
      ),
      entityRangeBlock: unflattenRangeBlock(
        afterText,
        clipFlatRanges(entities, snapped, source.length),
      ),
    },
  };
}

export function mergeTextAndRanges(
  first: SplitTextResult,
  second: SplitTextResult,
): SplitTextResult {
  const firstText = first.text ?? '';
  const secondText = second.text ?? '';
  const joined = firstText + secondText;
  const shift = firstText.length;

  const mergedStyles = [
    ...flattenRangeBlock(firstText, first.inlineStyleRangeBlock),
    ...flattenRangeBlock(secondText, second.inlineStyleRangeBlock).map(
      (range) => ({ ...range, offset: range.offset + shift }),
    ),
  ];
  const mergedEntities = [
    ...flattenRangeBlock(firstText, first.entityRangeBlock),
    ...flattenRangeBlock(secondText, second.entityRangeBlock).map((range) => ({
      ...range,
      offset: range.offset + shift,
    })),
  ];

  return {
    text: joined,
    inlineStyleRangeBlock: unflattenRangeBlock(joined, mergedStyles),
    entityRangeBlock: unflattenRangeBlock(joined, mergedEntities),
  };
}
