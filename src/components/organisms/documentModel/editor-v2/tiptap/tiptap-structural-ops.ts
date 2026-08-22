import { JSONContent } from '@tiptap/core';
import { IDocumentModelElement } from 'core/interfaces/api/IDocumentModel';
import { DocumentSectionChildrenTypeEnum } from 'project/enum/document-model.enum';

import { overlayDefined } from '../adapter/json-clone';
import { DocumentEditorIdFactory } from '../domain/document-editor-id';
import {
  mergeTextAndRanges,
  splitTextAndRanges,
} from '../domain/structural-edit';
import {
  extractParagraphContent,
  paragraphTextToContent,
} from './inline-ranges';

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isEditableType(type?: string) {
  return type === 'docParagraph' || type === 'docBullet';
}

function canonicalType(nodeType?: string) {
  return nodeType === 'docBullet'
    ? DocumentSectionChildrenTypeEnum.BULLET
    : DocumentSectionChildrenTypeEnum.PARAGRAPH;
}

export function splitTipTapEditableNode(
  doc: JSONContent,
  nodeId: string,
  offset: number,
  createId: DocumentEditorIdFactory,
): JSONContent {
  const next = cloneJson(doc);

  const visit = (nodes?: JSONContent[]): boolean => {
    if (!nodes) return false;

    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      if (isEditableType(node.type) && node.attrs?.id === nodeId) {
        const extracted = extractParagraphContent(node.content);
        const split = splitTextAndRanges(
          extracted.text,
          extracted.inlineStyleRangeBlock,
          extracted.entityRangeBlock,
          offset,
        );
        const newId = createId();
        const type = canonicalType(node.type);
        const baseSource = (node.attrs?.source || {
          id: nodeId,
          type,
          text: extracted.text,
        }) as IDocumentModelElement;

        node.content = paragraphTextToContent(
          split.before.text,
          split.before.inlineStyleRangeBlock,
          split.before.entityRangeBlock,
        );
        node.attrs = {
          ...node.attrs,
          id: nodeId,
          source: overlayDefined(baseSource, {
            id: nodeId,
            type,
            text: split.before.text,
            inlineStyleRangeBlock: split.before.inlineStyleRangeBlock,
            entityRangeBlock: split.before.entityRangeBlock,
          }),
        };

        nodes.splice(index + 1, 0, {
          type: node.type,
          attrs: {
            ...node.attrs,
            id: newId,
            source: overlayDefined(baseSource, {
              id: newId,
              type,
              text: split.after.text,
              inlineStyleRangeBlock: split.after.inlineStyleRangeBlock,
              entityRangeBlock: split.after.entityRangeBlock,
              ...(type === DocumentSectionChildrenTypeEnum.BULLET && {
                level: node.attrs?.level ?? baseSource.level,
              }),
            }),
          },
          content: paragraphTextToContent(
            split.after.text,
            split.after.inlineStyleRangeBlock,
            split.after.entityRangeBlock,
          ),
        });
        return true;
      }

      if (visit(node.content)) return true;
    }

    return false;
  };

  visit(next.content);
  return next;
}

export function mergeTipTapEditableNodeWithPrevious(
  doc: JSONContent,
  nodeId: string,
): JSONContent {
  const next = cloneJson(doc);

  const visit = (nodes?: JSONContent[]): boolean => {
    if (!nodes) return false;

    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      if (isEditableType(node.type) && node.attrs?.id === nodeId) {
        const previous = nodes[index - 1];
        if (!previous || previous.type !== node.type) {
          throw new Error(
            'Merge só é seguro entre nós editáveis consecutivos do mesmo tipo.',
          );
        }

        const first = extractParagraphContent(previous.content);
        const second = extractParagraphContent(node.content);
        const merged = mergeTextAndRanges(first, second);
        previous.content = paragraphTextToContent(
          merged.text,
          merged.inlineStyleRangeBlock,
          merged.entityRangeBlock,
        );
        previous.attrs = {
          ...previous.attrs,
          source: overlayDefined(
            (previous.attrs?.source || {
              id: previous.attrs?.id,
              type: canonicalType(previous.type),
              text: first.text,
            }) as IDocumentModelElement,
            {
              text: merged.text,
              inlineStyleRangeBlock: merged.inlineStyleRangeBlock,
              entityRangeBlock: merged.entityRangeBlock,
            },
          ),
        };
        nodes.splice(index, 1);
        return true;
      }

      if (visit(node.content)) return true;
    }

    return false;
  };

  visit(next.content);
  return next;
}

export function deleteTipTapEditableNode(
  doc: JSONContent,
  nodeId: string,
): JSONContent {
  const next = cloneJson(doc);

  const visit = (nodes?: JSONContent[]): boolean => {
    if (!nodes) return false;

    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      if (isEditableType(node.type) && node.attrs?.id === nodeId) {
        nodes.splice(index, 1);
        return true;
      }
      if (visit(node.content)) return true;
    }

    return false;
  };

  visit(next.content);
  return next;
}
