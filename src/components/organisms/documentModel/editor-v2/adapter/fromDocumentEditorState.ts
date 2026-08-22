import {
  IDocumentModelData,
  IDocumentModelElement,
  IDocumentModelGroup,
  IDocumentModelSection,
} from 'core/interfaces/api/IDocumentModel';
import { DocumentSectionChildrenTypeEnum } from 'project/enum/document-model.enum';

import {
  AtomBlock,
  BulletItem,
  DocumentEditorBlock,
  DocumentEditorGroup,
  DocumentEditorSection,
  DocumentEditorState,
  HeadingBlock,
  TextRunParagraph,
  isAtomBlock,
  isBulletRunBlock,
  isHeadingBlock,
  isLegacyBulletSpaceType,
  isTextRunBlock,
} from './document-editor-state.types';
import { cloneJson, overlayDefined } from './json-clone';

function paragraphFromEditor(
  paragraph: TextRunParagraph,
): IDocumentModelElement {
  return overlayDefined(paragraph.source, {
    id: paragraph.id,
    type: DocumentSectionChildrenTypeEnum.PARAGRAPH,
    text: paragraph.text,
    align: paragraph.align,
    size: paragraph.size,
    color: paragraph.color,
    lineHeight: paragraph.lineHeight,
    lineHeightBlock: paragraph.lineHeightBlock,
    inlineStyleRangeBlock: paragraph.inlineStyleRangeBlock,
    entityRangeBlock: paragraph.entityRangeBlock,
  });
}

function headingFromEditor(block: HeadingBlock): IDocumentModelElement {
  return overlayDefined(block.source, {
    id: block.id,
    type: block.type,
    text: block.text,
  });
}

function atomFromEditor(block: AtomBlock): IDocumentModelElement {
  return overlayDefined(block.source, {
    id: block.id,
    type: block.type,
  });
}

function bulletFromEditor(bullet: BulletItem): IDocumentModelElement {
  if (isLegacyBulletSpaceType(bullet.source.type)) {
    return overlayDefined(bullet.source, {
      id: bullet.id,
      type: bullet.source.type,
      text: bullet.text,
      align: bullet.align,
      size: bullet.size,
      color: bullet.color,
      lineHeight: bullet.lineHeight,
      lineHeightBlock: bullet.lineHeightBlock,
      inlineStyleRangeBlock: bullet.inlineStyleRangeBlock,
      entityRangeBlock: bullet.entityRangeBlock,
    });
  }

  return overlayDefined(bullet.source, {
    id: bullet.id,
    type: DocumentSectionChildrenTypeEnum.BULLET,
    text: bullet.text,
    level: bullet.level,
    align: bullet.align,
    size: bullet.size,
    color: bullet.color,
    lineHeight: bullet.lineHeight,
    lineHeightBlock: bullet.lineHeightBlock,
    inlineStyleRangeBlock: bullet.inlineStyleRangeBlock,
    entityRangeBlock: bullet.entityRangeBlock,
  });
}

function elementsFromBlock(
  block: DocumentEditorBlock,
): IDocumentModelElement[] {
  if (isTextRunBlock(block)) {
    return block.paragraphs.map(paragraphFromEditor);
  }
  if (isBulletRunBlock(block)) {
    return block.bullets.map(bulletFromEditor);
  }
  if (isHeadingBlock(block)) {
    return [headingFromEditor(block)];
  }
  if (isAtomBlock(block)) {
    return [atomFromEditor(block)];
  }

  return [];
}

function sectionNodeFromEditor(
  section: DocumentEditorSection,
): IDocumentModelSection {
  return overlayDefined(section.source, {
    id: section.id,
    type: section.type,
  });
}

function groupFromEditor(group: DocumentEditorGroup): IDocumentModelGroup {
  const children: Record<string, IDocumentModelElement[]> = {};
  let hasMapEntries = false;

  const data = group.sections.map((section) => {
    const node = sectionNodeFromEditor(section);
    const elements = section.blocks.flatMap(elementsFromBlock);

    if (section.childrenOrigin === 'inline') {
      node.children = elements;
      return node;
    }

    if (section.childrenOrigin === 'map' || elements.length > 0) {
      children[section.id] = elements;
      hasMapEntries = true;
    }

    return node;
  });

  const next: IDocumentModelGroup = { data };

  if (group.label != null) next.label = group.label;

  if (group.hadChildrenMap || hasMapEntries) {
    next.children = children;
  }

  return next;
}

export function fromDocumentEditorState(
  state: DocumentEditorState,
): IDocumentModelData {
  return {
    variables: cloneJson(state.variables || []),
    sections: (state.groups || []).map(groupFromEditor),
  };
}
