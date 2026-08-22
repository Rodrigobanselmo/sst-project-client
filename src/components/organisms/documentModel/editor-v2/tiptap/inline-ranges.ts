import { JSONContent } from '@tiptap/core';
import {
  IEntityRange,
  IInlineStyleRange,
} from 'core/interfaces/api/IDocumentModel';
import { InlineStyleTypeEnum } from 'project/enum/document-model.enum';

import {
  resolveVariablePresentation,
  serializeVariableToken,
  tokenizeVariableLine,
  VariableCatalogEntry,
} from '../domain/variable-token';

type MarkJson = { type: string; attrs?: Record<string, any> };

function markKey(mark: MarkJson): string {
  return JSON.stringify([
    mark.type,
    mark.attrs?.style ?? null,
    mark.attrs?.value ?? null,
    mark.attrs?.href ?? null,
    mark.attrs?.targetOption ?? mark.attrs?.target ?? null,
  ]);
}

function marksAtOffset(
  styles: IInlineStyleRange[] | undefined,
  entities: IEntityRange[] | undefined,
  offset: number,
): MarkJson[] {
  const marks: MarkJson[] = [];

  (styles || []).forEach((range) => {
    if (offset < range.offset || offset >= range.offset + range.length) return;

    if (range.style === InlineStyleTypeEnum.BOLD) {
      marks.push({ type: 'bold' });
      return;
    }
    if (range.style === InlineStyleTypeEnum.ITALIC) {
      marks.push({ type: 'italic' });
      return;
    }
    if (range.style === InlineStyleTypeEnum.UNDERLINE) {
      marks.push({ type: 'underline' });
      return;
    }

    marks.push({
      type: 'docStyle',
      attrs: {
        style: range.style,
        value: range.value ?? null,
      },
    });
  });

  (entities || []).forEach((range) => {
    if (range.data?.type !== 'LINK') return;
    if (offset < range.offset || offset >= range.offset + range.length) return;

    const href = range.data.data?.url || '';
    const targetOption = range.data.data?.targetOption || '_blank';
    marks.push({
      type: 'link',
      attrs: {
        href,
        target: targetOption,
        targetOption,
      },
    });
  });

  return marks.sort((a, b) => markKey(a).localeCompare(markKey(b)));
}

function sameMarks(a: MarkJson[], b: MarkJson[]) {
  if (a.length !== b.length) return false;
  return a.every((mark, index) => markKey(mark) === markKey(b[index]));
}

function textSliceToContent(
  text: string,
  baseOffset: number,
  styles?: IInlineStyleRange[],
  entities?: IEntityRange[],
): JSONContent[] {
  if (!text) return [];

  const content: JSONContent[] = [];
  let start = 0;

  while (start < text.length) {
    const current = marksAtOffset(styles, entities, baseOffset + start);
    let end = start + 1;
    while (
      end < text.length &&
      sameMarks(current, marksAtOffset(styles, entities, baseOffset + end))
    ) {
      end += 1;
    }

    content.push({
      type: 'text',
      text: text.slice(start, end),
      ...(current.length ? { marks: current } : {}),
    });
    start = end;
  }

  return content;
}

export function lineToInlineContent(
  text: string,
  styles?: IInlineStyleRange[],
  entities?: IEntityRange[],
  catalog?: VariableCatalogEntry[],
): JSONContent[] {
  if (!text) return [];

  const content: JSONContent[] = [];

  tokenizeVariableLine(text).forEach((token) => {
    if (token.kind === 'text') {
      content.push(
        ...textSliceToContent(token.text, token.start, styles, entities),
      );
      return;
    }

    const presentation = resolveVariablePresentation(token.type, catalog);
    const marks = marksAtOffset(styles, entities, token.start);
    content.push({
      type: 'docVariable',
      attrs: {
        type: presentation.type,
        label: presentation.label,
        unknown: presentation.unknown,
      },
      ...(marks.length ? { marks } : {}),
    });
  });

  return content;
}

export function paragraphTextToContent(
  text: string,
  inlineStyleRangeBlock?: IInlineStyleRange[][],
  entityRangeBlock?: IEntityRange[][],
  catalog?: VariableCatalogEntry[],
): JSONContent[] {
  const lines = (text ?? '').split('\n');
  const content: JSONContent[] = [];

  lines.forEach((line, index) => {
    content.push(
      ...lineToInlineContent(
        line,
        inlineStyleRangeBlock?.[index],
        entityRangeBlock?.[index],
        catalog,
      ),
    );
    if (index < lines.length - 1) {
      content.push({ type: 'hardBreak' });
    }
  });

  return content;
}

function pushRange<T extends { offset: number; length: number }>(
  ranges: T[],
  next: T,
) {
  const last = ranges[ranges.length - 1];
  if (
    last &&
    last.offset + last.length === next.offset &&
    JSON.stringify({ ...last, offset: 0, length: 0 }) ===
      JSON.stringify({ ...next, offset: 0, length: 0 })
  ) {
    last.length += next.length;
    return;
  }
  ranges.push(next);
}

function styleFromMark(mark: MarkJson): IInlineStyleRange | null {
  if (mark.type === 'bold') {
    return { offset: 0, length: 0, style: InlineStyleTypeEnum.BOLD };
  }
  if (mark.type === 'italic') {
    return { offset: 0, length: 0, style: InlineStyleTypeEnum.ITALIC };
  }
  if (mark.type === 'underline') {
    return { offset: 0, length: 0, style: InlineStyleTypeEnum.UNDERLINE };
  }
  if (mark.type === 'docStyle' && mark.attrs?.style) {
    return {
      offset: 0,
      length: 0,
      style: mark.attrs.style as InlineStyleTypeEnum,
      ...(mark.attrs.value != null && { value: String(mark.attrs.value) }),
    };
  }
  return null;
}

function entityFromMark(mark: MarkJson): IEntityRange | null {
  if (mark.type !== 'link') return null;
  return {
    offset: 0,
    length: 0,
    data: {
      type: 'LINK',
      mutability: 'MUTABLE',
      data: {
        url: String(mark.attrs?.href || ''),
        targetOption: String(
          mark.attrs?.targetOption || mark.attrs?.target || '_blank',
        ),
      },
    },
  };
}

export function extractParagraphContent(content?: JSONContent[]): {
  text: string;
  inlineStyleRangeBlock: IInlineStyleRange[][];
  entityRangeBlock: IEntityRange[][];
} {
  const lines = [
    {
      text: '',
      styles: [] as IInlineStyleRange[],
      entities: [] as IEntityRange[],
    },
  ];
  let line = lines[0];

  (content || []).forEach((node) => {
    if (node.type === 'hardBreak') {
      line = { text: '', styles: [], entities: [] };
      lines.push(line);
      return;
    }

    if (node.type === 'docVariable') {
      const chunk = serializeVariableToken(String(node.attrs?.type || ''));
      const start = line.text.length;
      line.text += chunk;

      (node.marks || []).forEach((mark) => {
        const style = styleFromMark(mark);
        if (style) {
          pushRange(line.styles, {
            ...style,
            offset: start,
            length: chunk.length,
          });
        }
        const entity = entityFromMark(mark);
        if (entity) {
          pushRange(line.entities, {
            ...entity,
            offset: start,
            length: chunk.length,
          });
        }
      });
      return;
    }

    if (node.type !== 'text') return;

    const chunk = node.text || '';
    const start = line.text.length;
    line.text += chunk;

    (node.marks || []).forEach((mark) => {
      const style = styleFromMark(mark);
      if (style) {
        pushRange(line.styles, {
          ...style,
          offset: start,
          length: chunk.length,
        });
      }
      const entity = entityFromMark(mark);
      if (entity) {
        pushRange(line.entities, {
          ...entity,
          offset: start,
          length: chunk.length,
        });
      }
    });
  });

  return {
    text: lines.map((item) => item.text).join('\n'),
    inlineStyleRangeBlock: lines.map((item) => item.styles),
    entityRangeBlock: lines.map((item) => item.entities),
  };
}

function sortRanges<
  T extends { offset: number; length: number; style?: string },
>(ranges: T[]): T[] {
  return [...ranges].sort((a, b) => {
    if (a.offset !== b.offset) return a.offset - b.offset;
    if (a.length !== b.length) return a.length - b.length;
    return JSON.stringify(a).localeCompare(JSON.stringify(b));
  });
}

function normalizeRangeBlock<T extends { offset: number; length: number }>(
  block?: T[][],
): T[][] {
  if (!block) return [];
  const normalized = block.map((line) => sortRanges(line || []));
  if (normalized.every((line) => line.length === 0)) return [];
  return normalized;
}

export function semanticallyEqualRangeBlocks<
  T extends { offset: number; length: number },
>(left?: T[][], right?: T[][]): boolean {
  return (
    JSON.stringify(normalizeRangeBlock(left)) ===
    JSON.stringify(normalizeRangeBlock(right))
  );
}
