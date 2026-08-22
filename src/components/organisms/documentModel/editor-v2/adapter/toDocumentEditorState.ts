import {
  IDocumentModelData,
  IDocumentModelElement,
  IDocumentModelGroup,
  IDocumentModelSection,
} from 'core/interfaces/api/IDocumentModel';
import {
  AtomBlock,
  BulletItem,
  BulletRunBlock,
  DocumentEditorBlock,
  DocumentEditorChildrenOrigin,
  DocumentEditorGroup,
  DocumentEditorHeadingType,
  DocumentEditorSection,
  DocumentEditorState,
  HeadingBlock,
  TextRunBlock,
  TextRunParagraph,
  DOCUMENT_EDITOR_BULLET_TYPE,
  DOCUMENT_EDITOR_TEXT_RUN_TYPE,
  isDocumentEditorHeadingType,
} from './document-editor-state.types';
import { cloneJson } from './json-clone';

function resolveChildrenOrigin(
  group: IDocumentModelGroup,
  section: IDocumentModelSection,
): DocumentEditorChildrenOrigin {
  if (group.children && section.id in group.children) return 'map';
  if (section.children) return 'inline';
  return 'none';
}

function resolveSectionElements(
  group: IDocumentModelGroup,
  section: IDocumentModelSection,
): IDocumentModelElement[] {
  const origin = resolveChildrenOrigin(group, section);
  if (origin === 'map') return group.children?.[section.id] || [];
  if (origin === 'inline') return section.children || [];
  return [];
}

function toTextRunParagraph(element: IDocumentModelElement): TextRunParagraph {
  return {
    id: element.id,
    text: element.text ?? '',
    ...(element.align != null && { align: element.align }),
    ...(element.size != null && { size: element.size }),
    ...(element.color != null && { color: element.color }),
    ...(element.lineHeight != null && { lineHeight: element.lineHeight }),
    ...(element.lineHeightBlock != null && {
      lineHeightBlock: cloneJson(element.lineHeightBlock),
    }),
    ...(element.inlineStyleRangeBlock != null && {
      inlineStyleRangeBlock: cloneJson(element.inlineStyleRangeBlock),
    }),
    ...(element.entityRangeBlock != null && {
      entityRangeBlock: cloneJson(element.entityRangeBlock),
    }),
    source: cloneJson(element),
  };
}

function toHeadingBlock(element: IDocumentModelElement): HeadingBlock {
  return {
    kind: 'heading',
    id: element.id,
    type: element.type as DocumentEditorHeadingType,
    text: element.text ?? '',
    source: cloneJson(element),
  };
}

function toAtomBlock(element: IDocumentModelElement): AtomBlock {
  return {
    kind: 'atom',
    id: element.id,
    type: element.type,
    source: cloneJson(element),
  };
}

function toBulletItem(element: IDocumentModelElement): BulletItem {
  return {
    ...toTextRunParagraph(element),
    ...(element.level != null && { level: element.level }),
  };
}

function groupElementsToBlocks(
  elements: IDocumentModelElement[],
): DocumentEditorBlock[] {
  const blocks: DocumentEditorBlock[] = [];
  let paragraphBuffer: TextRunParagraph[] = [];
  let bulletBuffer: BulletItem[] = [];

  const flushTextRun = () => {
    if (!paragraphBuffer.length) return;
    const block: TextRunBlock = {
      kind: 'text-run',
      paragraphs: paragraphBuffer,
    };
    blocks.push(block);
    paragraphBuffer = [];
  };

  const flushBulletRun = () => {
    if (!bulletBuffer.length) return;
    const block: BulletRunBlock = {
      kind: 'bullet-run',
      bullets: bulletBuffer,
    };
    blocks.push(block);
    bulletBuffer = [];
  };

  elements.forEach((element) => {
    if (element.type === DOCUMENT_EDITOR_TEXT_RUN_TYPE) {
      flushBulletRun();
      paragraphBuffer.push(toTextRunParagraph(element));
      return;
    }

    if (element.type === DOCUMENT_EDITOR_BULLET_TYPE) {
      flushTextRun();
      bulletBuffer.push(toBulletItem(element));
      return;
    }

    flushTextRun();
    flushBulletRun();

    if (isDocumentEditorHeadingType(element.type)) {
      blocks.push(toHeadingBlock(element));
      return;
    }

    blocks.push(toAtomBlock(element));
  });

  flushTextRun();
  flushBulletRun();
  return blocks;
}

function toEditorSection(
  group: IDocumentModelGroup,
  section: IDocumentModelSection,
): DocumentEditorSection {
  const childrenOrigin = resolveChildrenOrigin(group, section);
  const source = cloneJson(section);
  delete source.children;

  return {
    id: section.id,
    type: section.type,
    childrenOrigin,
    source,
    blocks: groupElementsToBlocks(resolveSectionElements(group, section)),
  };
}

function toEditorGroup(group: IDocumentModelGroup): DocumentEditorGroup {
  return {
    ...(group.label != null && { label: group.label }),
    hadChildrenMap: group.children != null,
    sections: (group.data || []).map((section) =>
      toEditorSection(group, section),
    ),
  };
}

export function toDocumentEditorState(
  model: IDocumentModelData,
): DocumentEditorState {
  return {
    variables: cloneJson(model.variables || []),
    groups: (model.sections || []).map(toEditorGroup),
  };
}
