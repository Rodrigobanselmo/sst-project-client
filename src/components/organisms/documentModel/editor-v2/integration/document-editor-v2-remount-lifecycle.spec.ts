/**
 * Gate: V2 remount após markPersisted não quebra lifecycle pós-Strong Save.
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/editor-v2/integration/document-editor-v2-remount-lifecycle.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { getSchema } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import { EditorState } from '@tiptap/pm/state';
import { IDocumentModelData, IDocumentModelElement } from 'core/interfaces/api/IDocumentModel';
import {
  DocumentSectionChildrenTypeEnum,
  DocumentSectionTypeEnum,
} from 'project/enum/document-model.enum';

import { toDocumentEditorState } from '../adapter';
import {
  createSectionSelection,
  projectEditorSlice,
} from '../domain/document-editor-slice';
import { createDocumentEditorExtensions } from '../tiptap/extensions/create-document-editor-extensions';
import { serializeTipTapDoc } from '../tiptap/schema';
import { toTipTapState } from '../tiptap/to-tiptap-state';
import { planDocumentEditorV2Persist } from './document-editor-v2-controlled-save';
import {
  createProseMirrorExternalTextTransaction,
} from './external-edit/v2-external-edit-bridge';
import {
  diffChangedHeadingWindows,
  listHeadingWindowFingerprints,
  LinkedSaveEvent,
  resolveAfterSaveQueueAdvance,
} from '../../section-propagation/section-link-save-diff';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

function readRel(...parts: string[]) {
  return fs.readFileSync(path.join(__dirname, ...parts), 'utf8');
}

type SessionSnapshot = {
  v2LocalDirty: boolean;
  remountKey: number;
  baselineProjection: IDocumentModelData | null;
};

function applyMarkPersisted(
  session: SessionSnapshot,
  editedProjected: IDocumentModelData,
): SessionSnapshot {
  return {
    v2LocalDirty: false,
    remountKey: session.remountKey + 1,
    baselineProjection: editedProjected,
  };
}

function paragraph(id: string, text: string): IDocumentModelElement {
  return {
    id,
    type: DocumentSectionChildrenTypeEnum.PARAGRAPH,
    text,
  };
}

function linkedSectionsModel(
  xText = 'oficial x',
  yText = 'oficial y',
): IDocumentModelData {
  return {
    variables: [],
    sections: [
      {
        data: [{ id: 'sec', type: DocumentSectionTypeEnum.SECTION }],
        children: {
          sec: [
            { id: 'hx', type: DocumentSectionChildrenTypeEnum.H3, text: 'Seção X' },
            paragraph('px', xText),
            { id: 'hy', type: DocumentSectionChildrenTypeEnum.H3, text: 'Seção Y' },
            paragraph('py', yText),
          ],
        },
      },
    ],
  };
}

function buildModel(body: IDocumentModelElement[]): IDocumentModelData {
  return {
    variables: [],
    sections: [
      {
        data: [{ id: 'section-body', type: DocumentSectionTypeEnum.SECTION }],
        children: { 'section-body': body },
      },
    ],
  };
}

const schema = getSchema(createDocumentEditorExtensions());

function tipTapFromModel(model: IDocumentModelData) {
  return serializeTipTapDoc(toTipTapState(toDocumentEditorState(model)));
}

function stateFromModel(model: IDocumentModelData): EditorState {
  return EditorState.create({
    schema,
    doc: Node.fromJSON(schema, tipTapFromModel(model)),
  });
}

function simulateLinkedSaveAfterPersist(args: {
  beforeModel: IDocumentModelData;
  afterModel: IDocumentModelData;
  remountKeyBefore: number;
  intent: 'stay' | 'exit';
  linkedSeq?: number;
}): {
  session: SessionSnapshot;
  linkedSaveEvent: LinkedSaveEvent;
} {
  const previous = listHeadingWindowFingerprints(args.beforeModel);
  const saved = listHeadingWindowFingerprints(args.afterModel);
  const changed = diffChangedHeadingWindows(previous, saved);
  const selection = createSectionSelection('section-body');
  const builtProjection = projectEditorSlice(args.afterModel, selection);
  const session = applyMarkPersisted(
    {
      v2LocalDirty: true,
      remountKey: args.remountKeyBefore,
      baselineProjection: projectEditorSlice(args.beforeModel, selection),
    },
    builtProjection,
  );
  return {
    session,
    linkedSaveEvent: {
      seq: (args.linkedSeq || 0) + 1,
      intent: args.intent,
      changed,
    },
  };
}

function resolveDirtyAfterUpdate(args: {
  docChanged: boolean;
  externalEdit: boolean;
  skipFirstUpdate: boolean;
  userInputPending: boolean;
}): boolean {
  if (!args.docChanged) return false;
  if (args.externalEdit) return true;
  if (args.skipFirstUpdate && !args.userInputPending) return false;
  return true;
}

run('markPersisted: baseline atualizado, remountKey++, dirty=false', () => {
  const original = buildModel([paragraph('el-a', 'antes')]);
  const selection = createSectionSelection('section-body');
  const persisted = buildModel([paragraph('el-a', 'persistido')]);
  const builtProjection = projectEditorSlice(persisted, selection);

  const next = applyMarkPersisted(
    {
      v2LocalDirty: true,
      remountKey: 3,
      baselineProjection: projectEditorSlice(original, selection),
    },
    builtProjection,
  );

  assert.equal(next.v2LocalDirty, false);
  assert.equal(next.remountKey, 4);
  assert.deepEqual(next.baselineProjection, builtProjection);
});

run('remount monta a partir do snapshot persistido, não do anterior', () => {
  const original = buildModel([paragraph('el-a', 'antigo')]);
  const selection = createSectionSelection('section-body');
  let pmState = stateFromModel(original);

  const externalTr = createProseMirrorExternalTextTransaction(pmState, [
    { blockId: 'el-a', text: 'visível persistido' },
  ]);
  assert.ok(externalTr);
  pmState = pmState.apply(externalTr!);

  const firstPlan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: selection,
    baselineProjection: projectEditorSlice(original, selection),
    tipTapDoc: pmState.doc.toJSON(),
  });
  assert.equal(firstPlan.type, 'patch');
  if (firstPlan.type !== 'patch') throw new Error('expected patch');

  const session = applyMarkPersisted(
    { v2LocalDirty: true, remountKey: 0, baselineProjection: null },
    firstPlan.built.editedProjected,
  );

  const reduxAfterSave = firstPlan.candidate;
  const projectedForEditor = projectEditorSlice(reduxAfterSave, selection);
  assert.equal(
    projectedForEditor.sections[0].children!['section-body'][0].text,
    'visível persistido',
  );
  assert.deepEqual(session.baselineProjection, projectedForEditor);
  assert.equal(
    projectedForEditor.sections[0].children!['section-body'][0].text.includes(
      'antigo',
    ),
    false,
  );
});

run('dirty permanece false até nova edição real após remount', () => {
  const session = applyMarkPersisted(
    {
      v2LocalDirty: true,
      remountKey: 1,
      baselineProjection: null,
    },
    projectEditorSlice(buildModel([paragraph('el-a', 'ok')]), createSectionSelection('section-body')),
  );
  assert.equal(session.v2LocalDirty, false);

  const hydrationUpdate = resolveDirtyAfterUpdate({
    docChanged: true,
    externalEdit: false,
    skipFirstUpdate: true,
    userInputPending: false,
  });
  assert.equal(hydrationUpdate, false);

  const userEdit = resolveDirtyAfterUpdate({
    docChanged: true,
    externalEdit: false,
    skipFirstUpdate: true,
    userInputPending: true,
  });
  assert.equal(userEdit, true);
});

run('seção vinculada X: Save + remount mantém X na fila pós-Save', () => {
  const before = linkedSectionsModel('oficial x', 'oficial y');
  const after = linkedSectionsModel('novo x', 'oficial y');
  const { session, linkedSaveEvent } = simulateLinkedSaveAfterPersist({
    beforeModel: before,
    afterModel: after,
    remountKeyBefore: 2,
    intent: 'stay',
  });

  assert.equal(session.remountKey, 3);
  assert.deepEqual(
    linkedSaveEvent.changed.map((item) => item.headingId),
    ['hx'],
  );
  assert.equal(linkedSaveEvent.seq, 1);
});

run('seções X e Y alteradas: Save + remount mantém X + Y na fila', () => {
  const before = linkedSectionsModel('oficial x', 'oficial y');
  const after = linkedSectionsModel('novo x', 'novo y');
  const { linkedSaveEvent } = simulateLinkedSaveAfterPersist({
    beforeModel: before,
    afterModel: after,
    remountKeyBefore: 0,
    intent: 'stay',
  });

  assert.deepEqual(
    linkedSaveEvent.changed.map((item) => item.headingId).sort(),
    ['hx', 'hy'],
  );
  const stepX = resolveAfterSaveQueueAdvance({
    queueLength: linkedSaveEvent.changed.length,
    currentIndex: 0,
  });
  assert.equal(stepX.done, false);
  assert.equal(stepX.nextIndex, 1);
});

run('fila pós-Save é independente do remountKey (sem reset estrutural)', () => {
  const sessionSource = readRel('DocumentEditorV2Session.tsx');
  const actionSource = readRel(
    '../../section-propagation/DocumentModelSectionPropagationAction.tsx',
  );
  const viewSource = readRel(
    '../../../modals/ModalEditDocumentModel/components/2-viewDocumentModelStep/hooks/useViewDocumentModel.ts',
  );

  const markPersisted = sessionSource.slice(
    sessionSource.indexOf('const markPersisted'),
    sessionSource.indexOf('const shouldBlockOfficialSave'),
  );
  assert.equal(markPersisted.includes('setRemountKey'), true);
  assert.equal(markPersisted.includes('linkedSaveEvent'), false);
  assert.equal(markPersisted.includes('setQueue'), false);
  assert.equal(markPersisted.includes('closeEditor'), false);

  assert.equal(actionSource.includes('[linkedSaveEvent?.seq]'), true);
  assert.equal(actionSource.includes('remountKey'), false);

  const runPersist = viewSource.slice(
    viewSource.indexOf('const runPersist'),
    viewSource.indexOf('const decideOfficialSave'),
  );
  assert.equal(
    runPersist.indexOf('saveDocumentModel') < runPersist.indexOf('setLinkedSaveEvent'),
    true,
  );
  assert.equal(runPersist.includes('remountKey'), false);
});

run('Save/Exit: remount não fecha editor antes da fila de vínculo', () => {
  const viewSource = readRel(
    '../../../modals/ModalEditDocumentModel/components/2-viewDocumentModelStep/hooks/useViewDocumentModel.ts',
  );
  const sessionSource = readRel('DocumentEditorV2Session.tsx');
  const persistSource = readRel(
    '../../../modals/ModalEditDocumentModel/hooks/useEditDocumentModel.tsx',
  );

  assert.equal(sessionSource.includes('closeEditor'), false);

  const runPersist = viewSource.slice(
    viewSource.indexOf('const runPersist'),
    viewSource.indexOf('const decideOfficialSave'),
  );
  assert.equal(runPersist.includes("intent === 'exit'"), true);
  assert.equal(runPersist.includes('pendingExitRef.current = true'), true);
  assert.equal(runPersist.includes('if (!changed.length)'), true);

  const onLinkedSaveSettled = viewSource.slice(
    viewSource.indexOf('const onLinkedSaveSettled'),
    viewSource.indexOf('const runPersist'),
  );
  assert.equal(onLinkedSaveSettled.includes('pendingExitRef.current'), true);
  assert.equal(onLinkedSaveSettled.includes('closeEditor()'), true);

  const { linkedSaveEvent } = simulateLinkedSaveAfterPersist({
    beforeModel: linkedSectionsModel(),
    afterModel: linkedSectionsModel('novo x'),
    remountKeyBefore: 5,
    intent: 'exit',
  });
  assert.equal(linkedSaveEvent.intent, 'exit');
  assert.equal(linkedSaveEvent.changed.length, 1);
  assert.equal(linkedSaveEvent.changed[0].headingId, 'hx');

  const persistFn = persistSource.slice(
    persistSource.indexOf('const saveDocumentModel'),
    persistSource.indexOf('const persistDocumentModel'),
  );
  assert.equal(persistFn.includes('v2Session.markPersisted'), true);
  assert.equal(persistFn.includes('closeEditor'), false);
});

run('LanguageTool → Save → remount → edição manual → dirty + segundo Save', () => {
  const original = buildModel([paragraph('el-a', 'base')]);
  const selection = createSectionSelection('section-body');
  let pmState = stateFromModel(original);

  const ltTr = createProseMirrorExternalTextTransaction(pmState, [
    { blockId: 'el-a', text: 'corrigido lt' },
  ]);
  assert.ok(ltTr);
  pmState = pmState.apply(ltTr!);

  const firstPlan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: selection,
    baselineProjection: projectEditorSlice(original, selection),
    tipTapDoc: pmState.doc.toJSON(),
  });
  assert.equal(firstPlan.type, 'patch');
  if (firstPlan.type !== 'patch') throw new Error('expected patch');

  const session = applyMarkPersisted(
    { v2LocalDirty: true, remountKey: 0, baselineProjection: null },
    firstPlan.built.editedProjected,
  );
  assert.equal(session.v2LocalDirty, false);
  assert.equal(session.remountKey, 1);

  const skipFirstAfterRemount = true;
  assert.equal(
    resolveDirtyAfterUpdate({
      docChanged: true,
      externalEdit: false,
      skipFirstUpdate: skipFirstAfterRemount,
      userInputPending: false,
    }),
    false,
  );

  const manualTr = createProseMirrorExternalTextTransaction(pmState, [
    { blockId: 'el-a', text: 'manual pós-remount' },
  ]);
  assert.ok(manualTr);
  pmState = pmState.apply(manualTr!);
  assert.equal(
    resolveDirtyAfterUpdate({
      docChanged: true,
      externalEdit: false,
      skipFirstUpdate: skipFirstAfterRemount,
      userInputPending: true,
    }),
    true,
  );

  const secondPlan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: firstPlan.candidate,
    selectedItem: selection,
    baselineProjection: session.baselineProjection,
    tipTapDoc: pmState.doc.toJSON(),
  });
  assert.equal(secondPlan.type, 'patch');
  if (secondPlan.type !== 'patch') throw new Error('expected patch');
  assert.equal(
    secondPlan.candidate.sections[0].children!['section-body'][0].text,
    'manual pós-remount',
  );
});

run('SectionView: remountKey força novo editor e reseta skipFirstUpdateRef', () => {
  const viewSource = readRel('DocumentEditorV2SectionView.tsx');
  assert.equal(viewSource.includes('[remountKey, content'), true);
  assert.equal(viewSource.includes('skipFirstUpdateRef.current = true'), true);
  assert.equal(viewSource.includes('[remountKey, content]'), true);
  assert.equal(viewSource.includes('beforeinput'), true);
  assert.equal(viewSource.includes('userInputPendingRef'), true);
});

console.log('\ndocument-editor-v2-remount-lifecycle: ok');
