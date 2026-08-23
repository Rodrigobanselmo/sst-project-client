import { NodeDocumentModel } from 'components/organisms/documentModel/DocumentModelTree/types/types';

import {
  createElementSelection,
  createSectionSelection,
  DocumentEditorSelection,
} from '../domain/document-editor-slice';

export function toDocumentEditorSelection(
  item: NodeDocumentModel | null | undefined,
): DocumentEditorSelection | null {
  if (!item) return null;

  if (item.data && 'section' in item.data && item.data.section) {
    return createSectionSelection(String(item.id));
  }

  if (item.data && 'element' in item.data && item.data.element) {
    return createElementSelection(
      String(item.id),
      String(item.data.type || ''),
      item.data.sectionId,
    );
  }

  return createSectionSelection(String(item.id));
}
