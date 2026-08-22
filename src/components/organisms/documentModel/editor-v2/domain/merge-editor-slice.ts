import {
  IDocumentModelData,
  IDocumentModelElement,
} from 'core/interfaces/api/IDocumentModel';

import { cloneJson } from '../adapter/json-clone';
import {
  DocumentEditorSelection,
  extractModelSectionElements,
  findSectionInModel,
  isSectionSelection,
  resolveSelectedSectionId,
} from './document-editor-slice';
import { StaleDocumentEditorSliceError } from './stale-document-editor-slice.error';

export type MergeEditorSliceInput = {
  originalModel: IDocumentModelData;
  selectedItem: DocumentEditorSelection;
  projectedBefore: IDocumentModelData;
  editedProjected: IDocumentModelData;
};

function elementIds(elements: IDocumentModelElement[]): string[] {
  return elements.map((element) => element.id);
}

function findContiguousWindow(
  children: IDocumentModelElement[],
  baselineIds: string[],
): { start: number; end: number } | null {
  if (!baselineIds.length) {
    return { start: 0, end: 0 };
  }

  const start = children.findIndex((element) => element.id === baselineIds[0]);
  if (start < 0) return null;

  const end = start + baselineIds.length;
  if (end > children.length) return null;

  const actual = elementIds(children.slice(start, end));
  if (actual.length !== baselineIds.length) return null;
  if (actual.some((id, index) => id !== baselineIds[index])) return null;

  return { start, end };
}

function writeSectionChildren(
  model: IDocumentModelData,
  sectionId: string,
  nextChildren: IDocumentModelElement[],
) {
  const located = findSectionInModel(model, sectionId);
  if (!located) {
    throw new StaleDocumentEditorSliceError(
      'section-missing',
      `Section ${sectionId} não encontrada no merge.`,
      { sectionId },
    );
  }

  if (located.origin === 'inline') {
    located.section.children = nextChildren;
    return;
  }

  if (located.origin === 'map') {
    if (!located.group.children) located.group.children = {};
    located.group.children[sectionId] = nextChildren;
    return;
  }

  if (nextChildren.length) {
    throw new StaleDocumentEditorSliceError(
      'window-mismatch',
      `Section ${sectionId} sem children no original não pode receber elementos.`,
      { sectionId },
    );
  }
}

export function mergeEditorSliceIntoDocumentModel(
  input: MergeEditorSliceInput,
): IDocumentModelData {
  const original = cloneJson(input.originalModel);
  const sectionId = resolveSelectedSectionId(original, input.selectedItem);

  if (!sectionId) {
    throw new StaleDocumentEditorSliceError(
      'section-missing',
      `Section da seleção ${input.selectedItem.id} não encontrada.`,
      { anchorId: String(input.selectedItem.id) },
    );
  }

  const located = findSectionInModel(original, sectionId);
  if (!located) {
    throw new StaleDocumentEditorSliceError(
      'section-missing',
      `Section ${sectionId} não encontrada no modelo original.`,
      { sectionId },
    );
  }

  const baselineChildren = extractModelSectionElements(
    input.projectedBefore,
    sectionId,
  );
  const editedChildren = extractModelSectionElements(
    input.editedProjected,
    sectionId,
  );
  const baselineIds = elementIds(baselineChildren);

  if (!isSectionSelection(input.selectedItem) && baselineIds.length === 0) {
    throw new StaleDocumentEditorSliceError(
      'anchor-missing',
      `Slice baseline vazio para âncora ${input.selectedItem.id}.`,
      { sectionId, anchorId: String(input.selectedItem.id) },
    );
  }

  if (
    !isSectionSelection(input.selectedItem) &&
    baselineIds[0] !== String(input.selectedItem.id) &&
    !baselineIds.includes(String(input.selectedItem.id))
  ) {
    throw new StaleDocumentEditorSliceError(
      'anchor-missing',
      `Âncora ${input.selectedItem.id} ausente no slice baseline.`,
      { sectionId, anchorId: String(input.selectedItem.id) },
    );
  }

  const window = findContiguousWindow(located.children, baselineIds);
  if (!window) {
    const anchorId = baselineIds[0] || String(input.selectedItem.id);
    const reason =
      located.children.some((element) => element.id === anchorId)
        ? 'window-mismatch'
        : baselineIds.length
          ? 'anchor-missing'
          : 'window-mismatch';
    throw new StaleDocumentEditorSliceError(
      reason,
      reason === 'anchor-missing'
        ? `Âncora ${anchorId} ausente na section ${sectionId}.`
        : `Janela do slice incompatível na section ${sectionId}.`,
      { sectionId, anchorId },
    );
  }

  const nextChildren = [
    ...located.children.slice(0, window.start),
    ...cloneJson(editedChildren),
    ...located.children.slice(window.end),
  ];

  writeSectionChildren(original, sectionId, nextChildren);
  return original;
}
