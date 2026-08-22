import {
  IDocumentModelData,
  IDocumentModelElement,
} from 'core/interfaces/api/IDocumentModel';
import { DocumentSectionChildrenTypeEnum } from 'project/enum/document-model.enum';

import { VARIABLE_CANONICAL_RE } from './variable-token';

export type DocumentModelValidationError = {
  code: string;
  path: string;
  message: string;
};

export type DocumentModelValidationResult = {
  ok: boolean;
  errors: DocumentModelValidationError[];
};

const ORIENTATIONS = new Set(['portrait', 'landscape']);

function push(
  errors: DocumentModelValidationError[],
  code: string,
  path: string,
  message: string,
) {
  errors.push({ code, path, message });
}

function validateRanges(
  element: IDocumentModelElement,
  path: string,
  errors: DocumentModelValidationError[],
) {
  const lines = (element.text || '').split('\n');

  const check = (
    block: Array<Array<{ offset: number; length: number }>> | undefined,
    kind: string,
  ) => {
    (block || []).forEach((line, lineIndex) => {
      const length = lines[lineIndex]?.length ?? 0;
      (line || []).forEach((range, rangeIndex) => {
        const rangePath = `${path}/${kind}/${lineIndex}/${rangeIndex}`;
        if (
          range.offset < 0 ||
          range.length < 0 ||
          range.offset + range.length > length
        ) {
          push(
            errors,
            'invalid-range',
            rangePath,
            `Range fora do texto (offset=${range.offset}, length=${range.length}, line=${length}).`,
          );
        }
      });
    });
  };

  check(element.inlineStyleRangeBlock, 'inlineStyleRangeBlock');
  check(element.entityRangeBlock, 'entityRangeBlock');
}

function validateVariableTokens(
  element: IDocumentModelElement,
  path: string,
  errors: DocumentModelValidationError[],
) {
  const text = element.text || '';
  const leftovers = text.replace(new RegExp(VARIABLE_CANONICAL_RE.source, 'g'), '');
  if (leftovers.includes('??')) {
    push(
      errors,
      'invalid-variable-token',
      `${path}/text`,
      'Token de variável incompleto ou corrompido.',
    );
  }
}

function validateElement(
  element: IDocumentModelElement,
  path: string,
  errors: DocumentModelValidationError[],
  seen: Set<string>,
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

  validateRanges(element, path, errors);
  validateVariableTokens(element, path, errors);
}

export function validateDocumentModelCandidate(
  model: IDocumentModelData,
): DocumentModelValidationResult {
  const errors: DocumentModelValidationError[] = [];
  const seen = new Set<string>();
  const sectionIds = new Set<string>();

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
        );
      });
    });
  });

  return { ok: errors.length === 0, errors };
}
