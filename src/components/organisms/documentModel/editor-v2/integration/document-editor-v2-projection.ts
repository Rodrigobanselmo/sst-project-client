import { JSONContent } from '@tiptap/core';
import { getModelSectionsBySelectedItem } from 'components/organisms/documentModel/DocumentModelContent/utils/getModelBySelectedItem';
import { NodeDocumentModel } from 'components/organisms/documentModel/DocumentModelTree/types/types';
import {
  IDocumentModelData,
  IDocumentModelElement,
  IDocumentModelFull,
  IDocumentModelSection,
} from 'core/interfaces/api/IDocumentModel';

import {
  DocumentEditorState,
  isAtomBlock,
  isBulletRunBlock,
  isHeadingBlock,
  isTextRunBlock,
} from '../adapter/document-editor-state.types';
import { cloneJson } from '../adapter/json-clone';

type SelectedSliceItem = IDocumentModelSection & {
  sectionIndex?: number;
  children?: IDocumentModelElement[];
};

export function projectSelectedContentToDocumentData(
  document: IDocumentModelData | null | undefined,
  catalogSections: IDocumentModelFull['sections'] | undefined,
  selectedItem: NodeDocumentModel | null | undefined,
): IDocumentModelData | null {
  if (!document || !selectedItem) return null;

  const slice = getModelSectionsBySelectedItem(
    document,
    catalogSections || {},
    selectedItem,
  ) as SelectedSliceItem[] | false | undefined;

  if (!Array.isArray(slice) || !slice.length) return null;

  const data: IDocumentModelSection[] = [];
  const children: Record<string, IDocumentModelElement[]> = {};

  slice.forEach((item) => {
    if (!item) return;
    const {
      children: inlineChildren,
      sectionIndex: _sectionIndex,
      ...section
    } = item;
    data.push(section);
    if (inlineChildren?.length) {
      children[section.id] = cloneJson(inlineChildren);
    }
  });

  return {
    variables: cloneJson(document.variables || []),
    sections: [
      {
        data,
        ...(Object.keys(children).length ? { children } : {}),
      },
    ],
  };
}

export function summarizeEditorProjection(state: DocumentEditorState) {
  const blocks = state.groups.flatMap((group) =>
    group.sections.flatMap((section) => section.blocks),
  );

  return {
    sectionIds: state.groups.flatMap((group) =>
      group.sections.map((section) => section.id),
    ),
    textRuns: blocks
      .filter(isTextRunBlock)
      .map((block) => block.paragraphs.map((paragraph) => paragraph.id)),
    headings: blocks
      .filter(isHeadingBlock)
      .map((block) => ({ id: block.id, type: block.type })),
    atoms: blocks
      .filter(isAtomBlock)
      .map((block) => ({ id: block.id, type: block.type })),
    bullets: blocks
      .filter(isBulletRunBlock)
      .map((block) => block.bullets.map((bullet) => bullet.id)),
  };
}

export function collectTipTapNodeIds(
  json: JSONContent | null | undefined,
  type: string,
): string[] {
  const ids: string[] = [];

  const walk = (node?: JSONContent) => {
    if (!node) return;
    if (node.type === type && node.attrs?.id) {
      ids.push(String(node.attrs.id));
    }
    node.content?.forEach(walk);
  };

  walk(json || undefined);
  return ids;
}

export function createSectionTreeNode(
  id: string,
  type = 'SECTION',
): NodeDocumentModel {
  return {
    id,
    parent: 0,
    text: id,
    droppable: true,
    data: {
      id,
      type,
      section: true,
    },
  };
}
