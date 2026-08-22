import {
  IDocumentModelData,
  IDocumentModelElement,
  IDocumentModelGroup,
  IDocumentModelSection,
} from 'core/interfaces/api/IDocumentModel';
import { DocumentSectionChildrenTypeEnum } from 'project/enum/document-model.enum';

import {
  AtomBlock,
  DocumentEditorBlock,
  DocumentEditorGroup,
  DocumentEditorSection,
  DocumentEditorState,
  HeadingBlock,
  TextRunParagraph,
  isAtomBlock,
  isHeadingBlock,
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

function elementsFromBlock(
  block: DocumentEditorBlock,
): IDocumentModelElement[] {
  if (isTextRunBlock(block)) {
    return block.paragraphs.map(paragraphFromEditor);
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
