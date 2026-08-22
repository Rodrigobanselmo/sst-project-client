import { IDocumentModelData } from 'core/interfaces/api/IDocumentModel';

import {
  DocumentEditorBlock,
  DocumentEditorState,
  isTextRunBlock,
} from './document-editor-state.types';

export function flattenBlockElements(
  block: DocumentEditorBlock,
): { id: string; type: string }[] {
  if (isTextRunBlock(block)) {
    return block.paragraphs.map((paragraph) => ({
      id: paragraph.id,
      type: paragraph.source.type,
    }));
  }

  return [{ id: block.id, type: block.type }];
}

export function collectCanonicalIds(model: IDocumentModelData): string[] {
  const ids: string[] = [];

  (model.sections || []).forEach((group) => {
    (group.data || []).forEach((section) => {
      if (section.id) ids.push(section.id);

      const fromMap = group.children?.[section.id];
      const children =
        fromMap ??
        (section.id && group.children && section.id in group.children
          ? group.children[section.id]
          : undefined) ??
        section.children ??
        [];

      children.forEach((element) => {
        if (element.id) ids.push(element.id);
      });
    });
  });

  return ids;
}

export function collectEditorIds(state: DocumentEditorState): string[] {
  const ids: string[] = [];

  state.groups.forEach((group) => {
    group.sections.forEach((section) => {
      if (section.id) ids.push(section.id);
      section.blocks.forEach((block) => {
        flattenBlockElements(block).forEach((element) => {
          if (element.id) ids.push(element.id);
        });
      });
    });
  });

  return ids;
}
