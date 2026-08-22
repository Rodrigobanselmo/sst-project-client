import { getSchema, JSONContent } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';

import { createDocumentEditorExtensions } from './extensions/create-document-editor-extensions';

export function getDocumentEditorSchema() {
  return getSchema(createDocumentEditorExtensions());
}

export function parseTipTapDoc(json: JSONContent) {
  return Node.fromJSON(getDocumentEditorSchema(), json);
}

export function serializeTipTapDoc(json: JSONContent): JSONContent {
  return parseTipTapDoc(json).toJSON() as JSONContent;
}
