import {
  IDocumentModelData,
  IDocumentModelElement,
} from 'core/interfaces/api/IDocumentModel';
import { DocumentSectionChildrenTypeEnum } from 'project/enum/document-model.enum';

import { persistJson } from '../adapter/json-clone';
import { VARIABLE_CANONICAL_RE } from './variable-token';

export type DocumentModelValidationError = {
  code: string;
  path: string;
  message: string;
  elementId?: string;
  elementType?: string;
  offset?: number;
  fragment?: string;
};

export type OutOfBoundRangeHit = {
  kind: 'inlineStyleRangeBlock' | 'entityRangeBlock';
  lineIndex: number;
  rangeIndex: number;
  offset: number;
  length: number;
  lineLength: number;
  textLength: number;
  style?: string;
};

export type DocumentModelValidationResult = {
  ok: boolean;
  errors: DocumentModelValidationError[];
};

export type ValidateDocumentModelOptions = {
  /**
   * Canonical antes do merge. Tokens incompletos que já existiam
   * no mesmo elemento não bloqueiam o Save (legado V1 preservado).
   */
  original?: IDocumentModelData;
};

export type VariableTokenMark = {
  kind: 'complete' | 'incomplete';
  start: number;
  end: number;
  sequence: string;
  inner?: string;
};

export type VariableInventoryKind =
  | 'complete-ascii'
  | 'complete-legacy'
  | 'complete-unknown'
  | 'incomplete'
  | 'plain-question';

export type VariableInventoryItem = {
  kind: VariableInventoryKind;
  path: string;
  elementId?: string;
  elementType?: string;
  offset: number;
  sequence: string;
  fragment: string;
};

const ORIENTATIONS = new Set(['portrait', 'landscape']);

/**
 * Token fechado no sentido do V1 (`split('??')` com par):
 * `??` + conteúdo não vazio sem `??` interno + `??`.
 * Aceita acentos, espaços e tipos oficiais (`MISSÃO_DA_EMPRESA`).
 * Não aceita `??TOKEN?` nem `?TOKEN??`.
 */
export const CLOSED_VARIABLE_TOKEN_RE = /\?\?((?:(?!\?\?)[\s\S])+)\?\?/g;

const ASCII_VARIABLE_INNER_RE = /^[A-Za-z0-9_]+$/;

function push(
  errors: DocumentModelValidationError[],
  code: string,
  path: string,
  message: string,
  extra?: Partial<DocumentModelValidationError>,
) {
  errors.push({ code, path, message, ...extra });
}

function fragmentAround(text: string, offset: number, length = 2): string {
  const from = Math.max(0, offset - 16);
  const to = Math.min(text.length, offset + length + 16);
  const core = text.slice(from, to);
  return `${from > 0 ? '...' : ''}${core}${to < text.length ? '...' : ''}`;
}

export function scanVariableTokenMarks(text: string): VariableTokenMark[] {
  const complete: VariableTokenMark[] = [];
  const matcher = new RegExp(CLOSED_VARIABLE_TOKEN_RE.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = matcher.exec(text))) {
    complete.push({
      kind: 'complete',
      start: match.index,
      end: match.index + match[0].length,
      sequence: match[0],
      inner: match[1],
    });
  }

  const incomplete: VariableTokenMark[] = [];
  let cursor = 0;
  const pushGap = (gap: string, base: number) => {
    let idx = 0;
    while ((idx = gap.indexOf('??', idx)) >= 0) {
      incomplete.push({
        kind: 'incomplete',
        start: base + idx,
        end: base + idx + 2,
        sequence: gap.slice(idx),
      });
      idx += 2;
    }
  };

  complete.forEach((token) => {
    pushGap(text.slice(cursor, token.start), cursor);
    cursor = token.end;
  });
  pushGap(text.slice(cursor), cursor);

  return [...complete, ...incomplete].sort((a, b) => a.start - b.start);
}

function leftoverGaps(text: string): string[] {
  const marks = scanVariableTokenMarks(text);
  const complete = marks.filter((item) => item.kind === 'complete');
  const gaps: string[] = [];
  let cursor = 0;
  complete.forEach((token) => {
    const gap = text.slice(cursor, token.start);
    if (gap.includes('??')) gaps.push(gap);
    cursor = token.end;
  });
  const tail = text.slice(cursor);
  if (tail.includes('??')) gaps.push(tail);
  return gaps;
}

function isGapSubset(candidateGaps: string[], originalGaps: string[]): boolean {
  const remaining = originalGaps.slice();
  return candidateGaps.every((gap) => {
    const index = remaining.indexOf(gap);
    if (index < 0) return false;
    remaining.splice(index, 1);
    return true;
  });
}

function introducedIncompleteMarks(
  candidateText: string,
  originalText: string | undefined,
): VariableTokenMark[] {
  const issues = scanVariableTokenMarks(candidateText).filter(
    (item) => item.kind === 'incomplete',
  );
  if (!issues.length) return [];
  if (originalText == null) return issues;
  if (originalText === candidateText) return [];
  const originalGaps = leftoverGaps(originalText);
  if (isGapSubset(leftoverGaps(candidateText), originalGaps)) {
    return [];
  }
  return issues.filter((item) => {
    const gap = leftoverGaps(candidateText).find((entry) =>
      entry.includes(item.sequence),
    );
    return !gap || !originalGaps.includes(gap);
  });
}

function indexElementsById(
  model?: IDocumentModelData,
): Map<string, IDocumentModelElement> {
  const map = new Map<string, IDocumentModelElement>();
  if (!model) return map;
  (model.sections || []).forEach((group) => {
    (group.data || []).forEach((section) => {
      (section.children || []).forEach((element) => {
        if (element.id) map.set(element.id, element);
      });
    });
    Object.values(group.children || {}).forEach((list) => {
      (list || []).forEach((element) => {
        if (element.id) map.set(element.id, element);
      });
    });
  });
  return map;
}

function rangeSurface(element: IDocumentModelElement) {
  return persistJson({
    text: element.text || '',
    inlineStyleRangeBlock: element.inlineStyleRangeBlock ?? null,
    entityRangeBlock: element.entityRangeBlock ?? null,
  });
}

function sameRangeSurface(
  left?: IDocumentModelElement,
  right?: IDocumentModelElement,
) {
  if (!left || !right) return false;
  return JSON.stringify(rangeSurface(left)) === JSON.stringify(rangeSurface(right));
}

export function listOutOfBoundRanges(
  element: IDocumentModelElement,
): OutOfBoundRangeHit[] {
  const text = element.text || '';
  const lines = text.split('\n');
  const hits: OutOfBoundRangeHit[] = [];

  const scan = (
    block: Array<Array<{ offset: number; length: number; style?: string }>> | undefined,
    kind: OutOfBoundRangeHit['kind'],
  ) => {
    (block || []).forEach((line, lineIndex) => {
      const lineLength = lines[lineIndex]?.length ?? 0;
      (line || []).forEach((range, rangeIndex) => {
        if (
          range.offset < 0 ||
          range.length < 0 ||
          range.offset + range.length > lineLength
        ) {
          hits.push({
            kind,
            lineIndex,
            rangeIndex,
            offset: range.offset,
            length: range.length,
            lineLength,
            textLength: text.length,
            style: range.style,
          });
        }
      });
    });
  };

  scan(element.inlineStyleRangeBlock, 'inlineStyleRangeBlock');
  scan(element.entityRangeBlock, 'entityRangeBlock');
  return hits;
}

function validateRanges(
  element: IDocumentModelElement,
  path: string,
  errors: DocumentModelValidationError[],
  original?: IDocumentModelElement,
) {
  if (original && sameRangeSurface(element, original)) {
    return;
  }

  const text = element.text || '';
  listOutOfBoundRanges(element).forEach((hit) => {
    const line = text.split('\n')[hit.lineIndex] || '';
    push(
      errors,
      'invalid-range',
      `${path}/${hit.kind}/${hit.lineIndex}/${hit.rangeIndex}`,
      `Range fora do texto (offset=${hit.offset}, length=${hit.length}, line=${hit.lineLength}).`,
      {
        elementId: element.id,
        elementType: element.type,
        offset: hit.offset,
        fragment: fragmentAround(line, 0, Math.min(line.length, 40)),
      },
    );
  });
}

function validateVariableTokens(
  element: IDocumentModelElement,
  path: string,
  errors: DocumentModelValidationError[],
  originalById: Map<string, IDocumentModelElement>,
) {
  const text = element.text || '';
  const originalText = element.id
    ? originalById.get(element.id)?.text
    : undefined;
  const issues = introducedIncompleteMarks(text, originalText);

  issues.forEach((issue) => {
    push(
      errors,
      'invalid-variable-token',
      `${path}/text`,
      'Token de variável incompleto ou corrompido.',
      {
        elementId: element.id,
        elementType: element.type,
        offset: issue.start,
        fragment: fragmentAround(text, issue.start, issue.sequence.length),
      },
    );
  });
}

function validateElement(
  element: IDocumentModelElement,
  path: string,
  errors: DocumentModelValidationError[],
  seen: Set<string>,
  originalById: Map<string, IDocumentModelElement>,
) {
  if (!element.id) {
    push(errors, 'missing-id', path, 'Elemento sem id.');
  } else if (seen.has(element.id)) {
    push(errors, 'duplicate-id', `${path}/id`, `Id duplicado: ${element.id}.`);
  } else {
    seen.add(element.id);
  }

  if (!element.type) {
    push(errors, 'missing-type', `${path}/type`, 'Elemento sem type.');
  }

  if (element.type === DocumentSectionChildrenTypeEnum.BULLET) {
    const level = element.level ?? 0;
    if (level < 0 || level > 6) {
      push(
        errors,
        'invalid-bullet-level',
        `${path}/level`,
        `BULLET level inválido: ${level}.`,
      );
    }
  }

  if (element.type === DocumentSectionChildrenTypeEnum.SECTION_BREAK) {
    if (
      element.orientation != null &&
      !ORIENTATIONS.has(String(element.orientation))
    ) {
      push(
        errors,
        'invalid-orientation',
        `${path}/orientation`,
        `SECTION_BREAK orientation inválida: ${element.orientation}.`,
      );
    }
  }

  validateRanges(
    element,
    path,
    errors,
    element.id ? originalById.get(element.id) : undefined,
  );
  validateVariableTokens(element, path, errors, originalById);
}

function walkModelElements(
  model: IDocumentModelData,
  visit: (
    element: IDocumentModelElement,
    path: string,
    sectionId?: string,
  ) => void,
) {
  (model.sections || []).forEach((group, groupIndex) => {
    (group.data || []).forEach((section, sectionIndex) => {
      const sectionPath = `sections/${groupIndex}/data/[${section.id || sectionIndex}]`;
      (section.children || []).forEach((element, elementIndex) => {
        visit(
          element,
          `${sectionPath}/children/[${element.id || elementIndex}]`,
          section.id,
        );
      });
    });

    Object.keys(group.children || {}).forEach((key) => {
      (group.children?.[key] || []).forEach((element, elementIndex) => {
        visit(
          element,
          `sections/${groupIndex}/children/${key}/[${element.id || elementIndex}]`,
          key,
        );
      });
    });
  });
}

export function inventoryDocumentModelVariableTokens(
  model: IDocumentModelData,
  catalogTypes?: Iterable<string>,
): VariableInventoryItem[] {
  const known = new Set(catalogTypes || []);
  const items: VariableInventoryItem[] = [];

  walkModelElements(model, (element, path) => {
    const text = element.text || '';
    const marks = scanVariableTokenMarks(text);
    marks.forEach((mark) => {
      if (mark.kind === 'complete') {
        const inner = mark.inner || '';
        const ascii = ASCII_VARIABLE_INNER_RE.test(inner);
        let kind: VariableInventoryKind = ascii
          ? 'complete-ascii'
          : 'complete-legacy';
        if (ascii && known.size && !known.has(inner)) {
          kind = 'complete-unknown';
        }
        items.push({
          kind,
          path: `${path}/text`,
          elementId: element.id,
          elementType: element.type,
          offset: mark.start,
          sequence: mark.sequence,
          fragment: fragmentAround(text, mark.start, mark.sequence.length),
        });
        return;
      }
      items.push({
        kind: 'incomplete',
        path: `${path}/text`,
        elementId: element.id,
        elementType: element.type,
        offset: mark.start,
        sequence: mark.sequence,
        fragment: fragmentAround(text, mark.start, mark.sequence.length),
      });
    });

    for (let index = 0; index < text.length; index += 1) {
      if (text[index] !== '?') continue;
      if (text[index - 1] === '?' || text[index + 1] === '?') continue;
      items.push({
        kind: 'plain-question',
        path: `${path}/text`,
        elementId: element.id,
        elementType: element.type,
        offset: index,
        sequence: '?',
        fragment: fragmentAround(text, index, 1),
      });
    }
  });

  return items;
}

export function validateDocumentModelCandidate(
  model: IDocumentModelData,
  options?: ValidateDocumentModelOptions,
): DocumentModelValidationResult {
  const errors: DocumentModelValidationError[] = [];
  const seen = new Set<string>();
  const sectionIds = new Set<string>();
  const originalById = indexElementsById(options?.original);

  (model.sections || []).forEach((group, groupIndex) => {
    (group.data || []).forEach((section, sectionIndex) => {
      const sectionPath = `sections/${groupIndex}/data/[${section.id || sectionIndex}]`;
      if (!section.id) {
        push(errors, 'missing-id', sectionPath, 'Section sem id.');
      } else if (seen.has(section.id)) {
        push(
          errors,
          'duplicate-id',
          `${sectionPath}/id`,
          `Id duplicado: ${section.id}.`,
        );
      } else {
        seen.add(section.id);
        sectionIds.add(section.id);
      }

      if (!section.type) {
        push(errors, 'missing-type', `${sectionPath}/type`, 'Section sem type.');
      }

      (section.children || []).forEach((element, elementIndex) => {
        validateElement(
          element,
          `${sectionPath}/children/[${element.id || elementIndex}]`,
          errors,
          seen,
          originalById,
        );
      });
    });

    Object.keys(group.children || {}).forEach((key) => {
      if (!sectionIds.has(key)) {
        push(
          errors,
          'invalid-children-key',
          `sections/${groupIndex}/children/${key}`,
          `children key ${key} não corresponde a section id.`,
        );
      }
      (group.children?.[key] || []).forEach((element, elementIndex) => {
        validateElement(
          element,
          `sections/${groupIndex}/children/${key}/[${element.id || elementIndex}]`,
          errors,
          seen,
          originalById,
        );
      });
    });
  });

  return { ok: errors.length === 0, errors };
}

/** Diagnóstico do algoritmo 5A (não usar no Save). */
export function leftoverAsciiVariableCheck(text: string): boolean {
  const leftovers = text.replace(
    new RegExp(VARIABLE_CANONICAL_RE.source, 'g'),
    '',
  );
  return leftovers.includes('??');
}
