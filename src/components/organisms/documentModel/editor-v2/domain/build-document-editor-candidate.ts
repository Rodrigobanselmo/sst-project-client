import { getSchema, JSONContent } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import { EditorState } from '@tiptap/pm/state';
import { IDocumentModelData } from 'core/interfaces/api/IDocumentModel';

import { fromDocumentEditorState } from '../adapter/fromDocumentEditorState';
import { DocumentEditorState } from '../adapter/document-editor-state.types';
import { applyStableEditableIds } from '../tiptap/assign-stable-ids';
import { createDocumentEditorExtensions } from '../tiptap/extensions/create-document-editor-extensions';
import { fromTipTapState } from '../tiptap/from-tiptap-state';
import {
  CanonicalDiffChange,
  canonicalDiff,
} from './canonical-diff';
import {
  createDocumentEditorId,
  DocumentEditorIdFactory,
} from './document-editor-id';
import {
  DocumentEditorSelection,
  projectEditorSlice,
} from './document-editor-slice';
import { mergeEditorSliceIntoDocumentModel } from './merge-editor-slice';
import {
  DocumentModelValidationResult,
  validateDocumentModelCandidate,
} from './validate-document-model';

let cachedSchema: ReturnType<typeof getSchema> | undefined;

function editorSchema() {
  if (!cachedSchema) {
    cachedSchema = getSchema(createDocumentEditorExtensions());
  }
  return cachedSchema;
}

export type BuildDocumentEditorCandidateInput = {
  originalModel: IDocumentModelData;
  selectedItem: DocumentEditorSelection;
  baselineProjection?: IDocumentModelData;
  editorState?: DocumentEditorState;
  tipTapDoc?: JSONContent;
  createId?: DocumentEditorIdFactory;
};

export type DocumentEditorCandidate = {
  candidate: IDocumentModelData;
  editedProjected: IDocumentModelData;
  baselineProjection: IDocumentModelData;
  diff: CanonicalDiffChange[];
  validation: DocumentModelValidationResult;
};

export function buildDocumentEditorCandidate(
  input: BuildDocumentEditorCandidateInput,
): DocumentEditorCandidate {
  const baselineProjection =
    input.baselineProjection ||
    projectEditorSlice(input.originalModel, input.selectedItem);

  const createId = input.createId || createDocumentEditorId;
  let editorState = input.editorState;
  if (!editorState && input.tipTapDoc) {
    const schema = editorSchema();
    const stabilized = applyStableEditableIds(
      EditorState.create({
        schema,
        doc: Node.fromJSON(schema, input.tipTapDoc),
      }),
      createId,
    );
    editorState = fromTipTapState(stabilized.doc.toJSON(), { createId });
  }
  if (!editorState) {
    throw new Error(
      'buildDocumentEditorCandidate exige editorState ou tipTapDoc.',
    );
  }

  const editedProjected = fromDocumentEditorState(editorState);
  const candidate = mergeEditorSliceIntoDocumentModel({
    originalModel: input.originalModel,
    selectedItem: input.selectedItem,
    projectedBefore: baselineProjection,
    editedProjected,
  });

  return {
    candidate,
    editedProjected,
    baselineProjection,
    diff: canonicalDiff(input.originalModel, candidate),
    validation: validateDocumentModelCandidate(candidate, {
      original: input.originalModel,
    }),
  };
}
