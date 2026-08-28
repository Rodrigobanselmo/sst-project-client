/**
 * External mutation / LanguageTool harness (no real extension).
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/external-edit/document-editor-external-mutation.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { getSchema } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import { EditorState, TextSelection } from '@tiptap/pm/state';
import { history, undo } from '@tiptap/pm/history';
import {
  convertFromRaw,
  convertToRaw,
  EditorState as DraftEditorState,
} from 'draft-js';
import {
  DocModelAlignmentType,
  IDocumentModelData,
  IDocumentModelElement,
} from 'core/interfaces/api/IDocumentModel';
import {
  DocumentSectionChildrenTypeEnum,
  DocumentSectionTypeEnum,
  InlineStyleTypeEnum,
} from 'project/enum/document-model.enum';

import { applyDraftDefaultValueChange } from 'components/molecules/form/draft-editor/draft-default-value.util';
import { reconcileDraftBlockText, reconcileDraftFromBlockTexts } from 'components/molecules/form/draft-editor/external-edit/classic-external-edit-bridge';
import { readDraftBlockTextsFromRoot } from 'components/molecules/form/draft-editor/external-edit/classic-external-edit-observer';
import { persistJson, toDocumentEditorState } from '../editor-v2/adapter';
import { applyInlineStyle } from '../editor-v2/tiptap/apply-text-format';
import { createDocumentEditorExtensions } from '../editor-v2/tiptap/extensions/create-document-editor-extensions';
import { serializeTipTapDoc } from '../editor-v2/tiptap/schema';
import { toTipTapState } from '../editor-v2/tiptap/to-tiptap-state';
import {
  createSectionSelection,
  projectEditorSlice,
} from '../editor-v2/domain/document-editor-slice';
import { planDocumentEditorV2Persist } from '../editor-v2/integration/document-editor-v2-controlled-save';
import {
  createProseMirrorExternalTextTransaction,
  reconcileProseMirrorBlockText,
  reconcileProseMirrorFromVisibleTexts,
} from '../editor-v2/integration/external-edit/v2-external-edit-bridge';
import {
  freezeDocumentModelSaveSnapshot,
  hashDocumentModelDataSync,
  serializeDocumentModelData,
} from 'components/organisms/modals/ModalEditDocumentModel/helpers/document-model-data-hash';
import {
  DOCUMENT_MODEL_EXTERNAL_SYNC_PENDING_MESSAGE,
  registerClassicExternalEditSync,
  registerV2ExternalEditSync,
  syncDocumentEditorExternalMutationsBeforeSave,
} from 'components/organisms/modals/ModalEditDocumentModel/helpers/document-model-external-sync';
import {
  createReentrancyGuard,
  collectVisibleText,
  mergeExternalTextWithProtectedRanges,
} from './document-editor-external-mutation';
import { allowDocumentEditorV2Transaction } from '../editor-v2/integration/document-editor-v2-guards';

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

const fromRaw = (
  text: string,
  extras: {
    key?: string;
    type?: string;
    styles?: Array<{ offset: number; length: number; style: string }>;
    entityRanges?: Array<{ offset: number; length: number; key: number }>;
    entityMap?: Record<string, unknown>;
  } = {},
) =>
  DraftEditorState.createWithContent(
    convertFromRaw({
      blocks: [
        {
          key: extras.key || 'a',
          text,
          type: extras.type || 'unstyled',
          depth: 0,
          inlineStyleRanges: (extras.styles || []) as never,
          entityRanges: extras.entityRanges || [],
          data: {},
        },
      ],
      entityMap: (extras.entityMap || {}) as never,
    }),
  );

const plain = (state: DraftEditorState) =>
  state.getCurrentContent().getPlainText();

const schema = getSchema(createDocumentEditorExtensions());

function paragraph(
  id: string,
  text: string,
  extra?: Partial<IDocumentModelElement>,
): IDocumentModelElement {
  return {
    id,
    type: DocumentSectionChildrenTypeEnum.PARAGRAPH,
    text,
    ...extra,
  };
}

function buildModel(body: IDocumentModelElement[]): IDocumentModelData {
  return {
    variables: [{ type: 'NOME_DA_EMPRESA', label: 'Nome da Empresa' }],
    sections: [
      {
        label: 'Grupo A',
        data: [
          {
            id: 'section-body',
            type: DocumentSectionTypeEnum.SECTION,
            hasChildren: true,
          },
        ],
        children: { 'section-body': body },
      },
    ],
  };
}

function tipTapFromModel(model: IDocumentModelData) {
  return serializeTipTapDoc(toTipTapState(toDocumentEditorState(model)));
}

function stateFromModel(model: IDocumentModelData): EditorState {
  return EditorState.create({
    schema,
    doc: Node.fromJSON(schema, tipTapFromModel(model)),
    plugins: [history()],
  });
}

function findBlockPos(doc: Node, id: string) {
  let pos = -1;
  doc.descendants((node, nodePos) => {
    if (
      ['docParagraph', 'docBullet', 'docHeading', 'docCaption'].includes(
        node.type.name,
      ) &&
      node.attrs.id === id
    ) {
      pos = nodePos;
      return false;
    }
  });
  if (pos < 0) throw new Error(`block ${id} not found`);
  return pos;
}

function setRange(state: EditorState, id: string, from: number, to: number) {
  const pos = findBlockPos(state.doc, id);
  return state.apply(
    state.tr.setSelection(
      TextSelection.create(state.doc, pos + 1 + from, pos + 1 + to),
    ),
  );
}

function v2Text(state: EditorState, id: string) {
  const pos = findBlockPos(state.doc, id);
  const node = state.doc.nodeAt(pos);
  return node?.textContent || '';
}

function textNode(value: string) {
  return { nodeType: 3, nodeValue: value, childNodes: [] };
}

function element(
  tag: string,
  attrs: Record<string, string>,
  children: unknown[] = [],
) {
  return {
    nodeType: 1,
    tagName: tag,
    className: attrs.class || '',
    getAttribute: (name: string) => attrs[name] ?? null,
    childNodes: children,
  };
}

run('1. Classic alteração externa de texto simples', () => {
  const state = fromRaw('risco ocupacional');
  const next = reconcileDraftBlockText({
    editorState: state,
    blockKey: 'a',
    nextText: 'risco ocupacional grave',
  });
  assert.ok(next);
  assert.equal(plain(next!), 'risco ocupacional grave');
});

run('2. Classic substituição de palavra', () => {
  const next = reconcileDraftBlockText({
    editorState: fromRaw('o funcionario caiu'),
    blockKey: 'a',
    nextText: 'o funcionário caiu',
  });
  assert.equal(plain(next!), 'o funcionário caiu');
});

run('3. Classic remoção', () => {
  const next = reconcileDraftBlockText({
    editorState: fromRaw('texto extra removido'),
    blockKey: 'a',
    nextText: 'texto removido',
  });
  assert.equal(plain(next!), 'texto removido');
});

run('4. Classic inserção', () => {
  const next = reconcileDraftBlockText({
    editorState: fromRaw('plano'),
    blockKey: 'a',
    nextText: 'plano de ação',
  });
  assert.equal(plain(next!), 'plano de ação');
});

run('5. Classic correção com acento', () => {
  const next = reconcileDraftBlockText({
    editorState: fromRaw('analise ergonometrica'),
    blockKey: 'a',
    nextText: 'análise ergonômica',
  });
  assert.equal(plain(next!), 'análise ergonômica');
});

run('6. Classic alteração em texto Bold', () => {
  const state = fromRaw('texto errado', {
    styles: [{ offset: 0, length: 12, style: 'BOLD' }],
  });
  const next = reconcileDraftBlockText({
    editorState: state,
    blockKey: 'a',
    nextText: 'texto certo',
  });
  assert.ok(next);
  assert.equal(plain(next!), 'texto certo');
  assert.equal(
    next!.getCurrentContent().getBlockForKey('a').getInlineStyleAt(0).has('BOLD'),
    true,
  );
  assert.equal(
    next!.getCurrentContent().getBlockForKey('a').getInlineStyleAt(6).has('BOLD'),
    true,
  );
});

run('7. Classic Italic', () => {
  const state = fromRaw('avaliacao', {
    styles: [{ offset: 0, length: 9, style: 'ITALIC' }],
  });
  const next = reconcileDraftBlockText({
    editorState: state,
    blockKey: 'a',
    nextText: 'avaliação',
  });
  assert.equal(plain(next!), 'avaliação');
  assert.equal(
    next!.getCurrentContent().getBlockForKey('a').getInlineStyleAt(0).has('ITALIC'),
    true,
  );
});

run('8. Classic link', () => {
  const state = fromRaw('clique aqui', {
    entityRanges: [{ offset: 0, length: 11, key: 0 }],
    entityMap: {
      0: {
        type: 'LINK',
        mutability: 'MUTABLE',
        data: { url: 'https://example.com' },
      },
    },
  });
  const next = reconcileDraftBlockText({
    editorState: state,
    blockKey: 'a',
    nextText: 'clique agora',
  });
  assert.equal(plain(next!), 'clique agora');
  const raw = convertToRaw(next!.getCurrentContent());
  assert.equal(raw.entityMap[0].type, 'LINK');
  assert.equal(raw.blocks[0].entityRanges[0].length, 'clique agora'.length);
});

run('9. Classic fontsize', () => {
  const state = fromRaw('tamanho do texto', {
    styles: [{ offset: 0, length: 16, style: 'fontsize-14' }],
  });
  const next = reconcileDraftBlockText({
    editorState: state,
    blockKey: 'a',
    nextText: 'tamanho do título',
  });
  assert.equal(plain(next!), 'tamanho do título');
  assert.equal(
    next!
      .getCurrentContent()
      .getBlockForKey('a')
      .getInlineStyleAt(10)
      .has('fontsize-14'),
    true,
  );
});

run('10. Classic bullet', () => {
  const next = reconcileDraftBlockText({
    editorState: fromRaw('item errado', { type: 'unordered-list-item' }),
    blockKey: 'a',
    nextText: 'item certo',
  });
  assert.equal(plain(next!), 'item certo');
  assert.equal(
    next!.getCurrentContent().getBlockForKey('a').getType(),
    'unordered-list-item',
  );
});

run('11. Classic heading', () => {
  const next = reconcileDraftBlockText({
    editorState: fromRaw('Titulo', { type: 'header-two' }),
    blockKey: 'a',
    nextText: 'Título',
  });
  assert.equal(plain(next!), 'Título');
  assert.equal(
    next!.getCurrentContent().getBlockForKey('a').getType(),
    'header-two',
  );
});

run('12. Classic variável protegida', () => {
  const token = '{{Nome da Empresa}}';
  const state = fromRaw(`Empresa ${token} ok`, {
    entityRanges: [{ offset: 8, length: token.length, key: 0 }],
    entityMap: {
      0: {
        type: 'MENTION',
        mutability: 'IMMUTABLE',
        data: { url: 'NOME_DA_EMPRESA', value: 'Nome da Empresa' },
      },
    },
  });
  const corrupted = reconcileDraftBlockText({
    editorState: state,
    blockKey: 'a',
    nextText: `Empresa ${token.slice(0, -2)} ok`,
  });
  assert.ok(corrupted);
  assert.equal(plain(corrupted!).includes(token), true);
  const beside = reconcileDraftBlockText({
    editorState: state,
    blockKey: 'a',
    nextText: `Empresa ${token} certo`,
  });
  assert.equal(plain(beside!), `Empresa ${token} certo`);
});

run('13. Classic múltiplas correções rápidas', () => {
  let state = fromRaw('um dois tres');
  state = reconcileDraftBlockText({
    editorState: state,
    blockKey: 'a',
    nextText: 'um dois três',
  })!;
  state = reconcileDraftBlockText({
    editorState: state,
    blockKey: 'a',
    nextText: 'um dois três quatro',
  })!;
  assert.equal(plain(state), 'um dois três quatro');
});

run('14. MutationObserver sem loop', () => {
  const guard = createReentrancyGuard();
  let count = 0;
  const fire = () => {
    if (guard.ignoreIfApplying()) return;
    count += 1;
    guard.run(() => fire());
  };
  fire();
  assert.equal(count, 1);
  const same = reconcileDraftFromBlockTexts(fromRaw('igual'), [
    { blockKey: 'a', text: 'igual' },
  ]);
  assert.equal(same.changed, false);
});

run('15. Classic dirty via emit/onChange path', () => {
  const draftSource = readRel(
    '../../../molecules/form/draft-editor/DraftEditor.tsx',
  );
  assert.equal(draftSource.includes('emitEditorStateToParent(next)'), true);
  assert.equal(draftSource.includes('registerClassicExternalEditSync'), true);
  const itemWrapper = readRel(
    '../DocumentModelContent/TypeSectionItem/ItemWrapper.tsx',
  );
  assert.equal(itemWrapper.includes('handleEdit('), true);
  assert.equal(itemWrapper.includes('parseFromEditorToElement'), true);
});

run('16. Classic undo', () => {
  const original = fromRaw('ocorreu um erro');
  const next = reconcileDraftBlockText({
    editorState: original,
    blockKey: 'a',
    nextText: 'ocorreu um acerto',
  })!;
  const undone = DraftEditorState.undo(next);
  assert.equal(plain(undone), 'ocorreu um erro');
});

run('17. Save snapshot inclui alteração externa', () => {
  const next = reconcileDraftBlockText({
    editorState: fromRaw('conteúdo antigo'),
    blockKey: 'a',
    nextText: 'conteúdo visível',
  })!;
  const raw = convertToRaw(next.getCurrentContent());
  const snapshot = freezeDocumentModelSaveSnapshot({
    variables: {},
    sections: [{ data: [{ type: 'PARAGRAPH', text: raw.blocks[0].text }] }],
  });
  assert.equal(
    serializeDocumentModelData(snapshot).includes('conteúdo visível'),
    true,
  );
  assert.equal(serializeDocumentModelData(snapshot).includes('antigo'), false);
});

run('18. blur não perde alteração (flush lê EditorState atual)', () => {
  const draftSource = readRel(
    '../../../molecules/form/draft-editor/DraftEditor.tsx',
  );
  assert.equal(draftSource.includes('observerHandleRef.current?.syncNow()'), true);
  assert.equal(draftSource.includes('emitCurrentEditorToParent()'), true);
  assert.equal(draftSource.includes('onBlur'), true);
});

run('19. GATE reset defaultValue não perde correção externa', () => {
  const original = fromRaw('texto errado');
  const originalRaw = convertToRaw(original.getCurrentContent());
  let appliedFingerprint = null as string | null;
  const hydrated = applyDraftDefaultValueChange({
    defaultValue: originalRaw,
    isJson: true,
    appliedFingerprint,
  });
  assert.equal(hydrated.skipped, false);
  if (hydrated.skipped) throw new Error('expected hydrate');
  appliedFingerprint = hydrated.fingerprint;
  let editorState = hydrated.editorState;

  const reconciled = reconcileDraftBlockText({
    editorState,
    blockKey: editorState.getCurrentContent().getFirstBlock().getKey(),
    nextText: 'texto certo',
  });
  assert.ok(reconciled);
  editorState = reconciled!;
  assert.equal(plain(editorState), 'texto certo');

  const emitted = convertToRaw(editorState.getCurrentContent());
  const onChangePayload = JSON.stringify(emitted);
  const parentDefaultValue = JSON.parse(onChangePayload) as typeof emitted;
  parentDefaultValue.blocks[0].key = 'parent-rerender-key';

  const afterParentRender = applyDraftDefaultValueChange({
    defaultValue: parentDefaultValue,
    isJson: true,
    appliedFingerprint,
  });
  assert.equal(afterParentRender.skipped, false);
  if (afterParentRender.skipped) throw new Error('expected apply after emit');
  assert.equal(plain(afterParentRender.editorState), 'texto certo');
  assert.equal(plain(afterParentRender.editorState).includes('errado'), false);

  const secondRenderSameContent = applyDraftDefaultValueChange({
    defaultValue: {
      ...parentDefaultValue,
      blocks: [{ ...parentDefaultValue.blocks[0], key: 'another-key' }],
    },
    isJson: true,
    appliedFingerprint: afterParentRender.fingerprint,
  });
  assert.equal(secondRenderSameContent.skipped, true);

  const draftSource = readRel(
    '../../../molecules/form/draft-editor/DraftEditor.tsx',
  );
  assert.equal(draftSource.includes('applyDraftDefaultValueChange'), true);
  assert.equal(draftSource.includes('editorStateRef.current = next'), true);
  assert.equal(draftSource.includes('emitEditorStateToParent(next)'), true);
});

run('20. troca Classic/V2 não perde — sync entra no estado antes do Save', () => {
  const persist = readRel(
    '../../modals/ModalEditDocumentModel/hooks/useEditDocumentModel.tsx',
  );
  const persistFn = persist.slice(
    persist.indexOf('const saveDocumentModel'),
    persist.indexOf('const persistDocumentModel'),
  );
  assert.equal(
    persistFn.includes('syncDocumentEditorExternalMutationsBeforeSave'),
    true,
  );
  assert.equal(
    persistFn.indexOf('syncDocumentEditorExternalMutationsBeforeSave') <
      persistFn.indexOf('flushActiveClassicDocumentModelEditor'),
    true,
  );
  assert.equal(
    persistFn.indexOf('flushActiveClassicDocumentModelEditor') <
      persistFn.indexOf('planPersist'),
    true,
  );
});

run('21. Strong Save intacto — gate termina antes do snapshot', () => {
  const persist = readRel(
    '../../modals/ModalEditDocumentModel/hooks/useEditDocumentModel.tsx',
  );
  const persistFn = persist.slice(
    persist.indexOf('const saveDocumentModel'),
    persist.indexOf('const persistDocumentModel'),
  );
  assert.equal(
    persistFn.indexOf('syncDocumentEditorExternalMutationsBeforeSave') <
      persistFn.indexOf('prepareDocumentModelSaveSnapshot'),
    true,
  );
  assert.equal(
    persistFn.indexOf('prepareDocumentModelSaveSnapshot') <
      persistFn.indexOf('mutateAsync'),
    true,
  );
  assert.equal(persistFn.includes('/save'), false);
  assert.equal(persistFn.includes('clientHash'), true);
  assert.equal(persistFn.includes('expectedUpdatedAt'), true);
});

run('22. optimistic lock intacto', () => {
  const persist = readRel(
    '../../modals/ModalEditDocumentModel/hooks/useEditDocumentModel.tsx',
  );
  const persistFn = persist.slice(
    persist.indexOf('const saveDocumentModel'),
    persist.indexOf('const persistDocumentModel'),
  );
  assert.equal(persistFn.includes('expectedUpdatedAt'), true);
  assert.equal(persistFn.includes('isDocumentModelConflict'), true);
});

run('23. 6A / 7A arquivos não reescritos', () => {
  const pageLayout = readRel(
    '../editor-v2/integration/document-editor-v2-page-layout.ts',
  );
  assert.equal(pageLayout.includes('Fase 6A'), true);
  const changeCase = readRel(
    '../editor-v2/tiptap/extensions/document-text-case.extension.ts',
  );
  assert.equal(changeCase.includes('DocumentTextCase'), true);
});

run('Classic harness: mutar text node do contenteditable', () => {
  const block = element(
    'div',
    { 'data-block': 'true', 'data-offset-key': 'a-0-0' },
    [
      element('span', { 'data-text': 'true' }, [textNode('texto errado')]),
      element('lt-highlighter', { class: 'lt-highlight' }, [
        textNode(''),
      ]),
    ],
  );
  const root = {
    querySelectorAll: () => [block as never],
  };
  const read = readDraftBlockTextsFromRoot(root);
  assert.equal(read[0].blockKey, 'a');
  assert.equal(read[0].text, 'texto errado');
  const next = reconcileDraftFromBlockTexts(fromRaw('texto errado'), [
    { blockKey: 'a', text: 'texto certo' },
  ]);
  assert.equal(next.changed, true);
  assert.equal(plain(next.editorState), 'texto certo');
});

run('Classic ignora chrome LanguageTool ao ler o DOM', () => {
  const block = element(
    'div',
    { 'data-block': 'true', 'data-offset-key': 'a-0-0' },
    [
      element('span', {}, [textNode('correção')]),
      element('lt-wrapper', { class: 'lt-toolbar' }, [textNode('ignorar')]),
    ],
  );
  assert.equal(collectVisibleText(block as never), 'correção');
});

run('V2: texto simples / substituição / remoção / inserção / acento', () => {
  const original = buildModel([paragraph('el-a', 'analise do risco')]);
  let state = stateFromModel(original);
  state = reconcileProseMirrorBlockText({
    state,
    blockId: 'el-a',
    nextText: 'análise do risco grave',
  })!;
  assert.equal(v2Text(state, 'el-a'), 'análise do risco grave');
  state = reconcileProseMirrorBlockText({
    state,
    blockId: 'el-a',
    nextText: 'análise grave',
  })!;
  assert.equal(v2Text(state, 'el-a'), 'análise grave');
});

run('V2 Bold / Italic / link / fontsize / bullet / heading', () => {
  const original = buildModel([
    paragraph('el-a', 'texto errado'),
    {
      id: 'el-b',
      type: DocumentSectionChildrenTypeEnum.BULLET,
      text: 'item errado',
      level: 0,
    },
    { id: 'el-h', type: DocumentSectionChildrenTypeEnum.H2, text: 'Titulo' },
  ]);
  let state = stateFromModel(original);
  state = applyInlineStyle(
    setRange(state, 'el-a', 0, 12),
    InlineStyleTypeEnum.BOLD,
  ).state;
  state = reconcileProseMirrorBlockText({
    state,
    blockId: 'el-a',
    nextText: 'texto certo',
  })!;
  assert.equal(v2Text(state, 'el-a'), 'texto certo');
  const pos = findBlockPos(state.doc, 'el-a');
  const para = state.doc.nodeAt(pos)!;
  let hasBold = false;
  para.descendants((node) => {
    if (
      node.isText &&
      node.marks.some(
        (mark) =>
          mark.type.name === 'docStyle' &&
          mark.attrs.style === InlineStyleTypeEnum.BOLD,
      )
    ) {
      hasBold = true;
    }
  });
  assert.equal(hasBold, true);

  state = reconcileProseMirrorBlockText({
    state,
    blockId: 'el-b',
    nextText: 'item certo',
  })!;
  assert.equal(v2Text(state, 'el-b'), 'item certo');
  assert.equal(state.doc.nodeAt(findBlockPos(state.doc, 'el-b'))?.type.name, 'docBullet');

  state = reconcileProseMirrorBlockText({
    state,
    blockId: 'el-h',
    nextText: 'Título',
  })!;
  assert.equal(v2Text(state, 'el-h'), 'Título');
  assert.equal(state.doc.nodeAt(findBlockPos(state.doc, 'el-h'))?.type.name, 'docHeading');
});

run('V2 variável protegida e canônica', () => {
  const original = buildModel([
    paragraph('el-a', 'Empresa ??NOME_DA_EMPRESA?? ok'),
  ]);
  const state = stateFromModel(original);
  const next = reconcileProseMirrorBlockText({
    state,
    blockId: 'el-a',
    nextText: 'Empresa  certo',
  });
  assert.ok(next);
  let hasVariable = false;
  next!.doc.descendants((node) => {
    if (node.type.name === 'docVariable') hasVariable = true;
  });
  assert.equal(hasVariable, true);
  const withLabel = reconcileProseMirrorBlockText({
    state,
    blockId: 'el-a',
    nextText: 'Empresa Nome da Empresa certo',
  });
  assert.ok(withLabel);
  let stillHasVariable = false;
  withLabel!.doc.descendants((node) => {
    if (node.type.name === 'docVariable') stillHasVariable = true;
  });
  assert.equal(stillHasVariable, true);
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: createSectionSelection('section-body'),
    baselineProjection: projectEditorSlice(
      original,
      createSectionSelection('section-body'),
    ),
    tipTapDoc: withLabel!.doc.toJSON(),
  });
  assert.equal(plan.type === 'patch' || plan.type === 'no-op', true);
  if (plan.type === 'patch') {
    assert.equal(
      plan.candidate.sections[0].children!['section-body'][0].text.includes(
        '??NOME_DA_EMPRESA??',
      ),
      true,
    );
  }
});

run('V2 múltiplas correções + undo + transaction', () => {
  let state = stateFromModel(buildModel([paragraph('el-a', 'um dois')]));
  const first = createProseMirrorExternalTextTransaction(state, [
    { blockId: 'el-a', text: 'um dois três' },
  ]);
  assert.ok(first);
  assert.equal(first!.getMeta('externalEdit'), true);
  state = state.apply(first!);
  state = reconcileProseMirrorFromVisibleTexts(state, [
    { blockId: 'el-a', text: 'um dois três quatro' },
  ]).state;
  assert.equal(v2Text(state, 'el-a'), 'um dois três quatro');
  let undone = state;
  const canUndo = undo(state, (tr) => {
    undone = state.apply(tr);
  });
  assert.equal(canUndo, true);
  assert.notEqual(v2Text(undone, 'el-a'), 'um dois três quatro');
});

run('V2 ProtectV2Boundaries permite correção de texto', () => {
  const original = buildModel([
    paragraph('el-a', 'texto'),
    { id: 'el-h', type: DocumentSectionChildrenTypeEnum.H2, text: 'Keep' },
  ]);
  const state = stateFromModel(original);
  const tr = createProseMirrorExternalTextTransaction(state, [
    { blockId: 'el-a', text: 'texto novo' },
  ]);
  assert.ok(tr);
  assert.equal(allowDocumentEditorV2Transaction(tr!, state), true);
});

run('V2 Save inclui alteração externa', () => {
  const original = buildModel([paragraph('el-a', 'antigo')]);
  const state = reconcileProseMirrorBlockText({
    state: stateFromModel(original),
    blockId: 'el-a',
    nextText: 'visível',
  })!;
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: createSectionSelection('section-body'),
    baselineProjection: projectEditorSlice(
      original,
      createSectionSelection('section-body'),
    ),
    tipTapDoc: state.doc.toJSON(),
  });
  assert.equal(plan.type, 'patch');
  if (plan.type === 'patch') {
    assert.equal(
      plan.candidate.sections[0].children!['section-body'][0].text,
      'visível',
    );
  }
});

run('pre-save gate bloqueia só se sync inseguro', () => {
  const unregister = registerClassicExternalEditSync(() => ({ ok: false }));
  const blocked = syncDocumentEditorExternalMutationsBeforeSave();
  assert.equal(blocked.ok, false);
  unregister();
  const ok = syncDocumentEditorExternalMutationsBeforeSave();
  assert.equal(ok.ok, true);
  assert.equal(
    DOCUMENT_MODEL_EXTERNAL_SYNC_PENDING_MESSAGE.includes(
      'alterações externas ainda sendo sincronizadas',
    ),
    true,
  );
});

run('LanguageTool continua permitido — nenhum bloqueio de extensão', () => {
  const draftSource = readRel(
    '../../../molecules/form/draft-editor/DraftEditor.tsx',
  );
  const v2View = readRel('../editor-v2/integration/DocumentEditorV2SectionView.tsx');
  const observer = readRel(
    '../../../molecules/form/draft-editor/external-edit/classic-external-edit-observer.ts',
  );
  const v2Ext = readRel(
    '../editor-v2/integration/external-edit/v2-external-edit-extension.ts',
  );
  assert.equal(draftSource.includes('contenteditable={false}'), false);
  assert.equal(v2View.includes('spellcheck={false}'), false);
  assert.equal(observer.includes('MutationObserver'), true);
  assert.equal(v2Ext.includes('MutationObserver'), true);
  assert.equal(v2View.includes('AbsorbExternalMutations'), true);
  assert.equal(draftSource.includes('spellcheck={false}'), false);
});

run('tokens protegidos não são corrompidos no merge', () => {
  const token = '{{Nome da Empresa}}';
  const merged = mergeExternalTextWithProtectedRanges(
    `ver ${token} agora`,
    `ver ${token.slice(0, 4)} agora`,
    [{ start: 4, end: 4 + token.length, text: token }],
  );
  assert.equal(merged.preservedTokens, true);
  assert.equal(merged.text.includes(token), true);
});

run('V2 register/sync wiring', () => {
  const ext = readRel(
    '../editor-v2/integration/external-edit/v2-external-edit-extension.ts',
  );
  assert.equal(ext.includes('registerV2ExternalEditSync'), true);
  assert.equal(ext.includes('flush'), true);
  void persistJson;
  void DocModelAlignmentType;
  void registerV2ExternalEditSync;
});

run('GATE estilos mistos: metade Bold / link parcial / FontSize distinto', () => {
  const mixedBold = reconcileDraftBlockText({
    editorState: fromRaw('ABCDEF', {
      styles: [{ offset: 0, length: 3, style: 'BOLD' }],
    }),
    blockKey: 'a',
    nextText: 'ABXYEF',
  })!;
  assert.equal(plain(mixedBold), 'ABXYEF');
  const boldBlock = mixedBold.getCurrentContent().getBlockForKey('a');
  assert.equal(boldBlock.getInlineStyleAt(0).has('BOLD'), true);
  assert.equal(boldBlock.getInlineStyleAt(1).has('BOLD'), true);
  assert.equal(boldBlock.getInlineStyleAt(2).has('BOLD'), true);
  assert.equal(boldBlock.getInlineStyleAt(3).has('BOLD'), false);
  assert.equal(boldBlock.getInlineStyleAt(4).has('BOLD'), false);
  assert.equal(boldBlock.getInlineStyleAt(5).has('BOLD'), false);

  const mixedLink = reconcileDraftBlockText({
    editorState: fromRaw('aaabbb', {
      entityRanges: [{ offset: 0, length: 3, key: 0 }],
      entityMap: {
        0: {
          type: 'LINK',
          mutability: 'MUTABLE',
          data: { url: 'https://example.com' },
        },
      },
    }),
    blockKey: 'a',
    nextText: 'aaxybb',
  })!;
  assert.equal(plain(mixedLink), 'aaxybb');
  const linkBlock = mixedLink.getCurrentContent().getBlockForKey('a');
  assert.equal(Boolean(linkBlock.getEntityAt(1)), true);
  assert.equal(Boolean(linkBlock.getEntityAt(2)), true);
  assert.equal(Boolean(linkBlock.getEntityAt(3)), false);
  assert.equal(Boolean(linkBlock.getEntityAt(4)), false);

  const mixedSize = reconcileDraftBlockText({
    editorState: fromRaw('ABCDEF', {
      styles: [
        { offset: 0, length: 3, style: 'fontsize-12' },
        { offset: 3, length: 3, style: 'fontsize-18' },
      ],
    }),
    blockKey: 'a',
    nextText: 'ABXYEF',
  })!;
  const sizeBlock = mixedSize.getCurrentContent().getBlockForKey('a');
  assert.equal(sizeBlock.getInlineStyleAt(2).has('fontsize-12'), true);
  assert.equal(sizeBlock.getInlineStyleAt(3).has('fontsize-18'), true);
  assert.equal(sizeBlock.getInlineStyleAt(3).has('fontsize-12'), false);
});

run('GATE sync-before-save reconcilia DOM pendente e só então hasheia', () => {
  let live = fromRaw('conteúdo antigo');
  assert.equal(plain(live), 'conteúdo antigo');
  const unregister = registerClassicExternalEditSync(() => {
    const result = reconcileDraftFromBlockTexts(live, [
      { blockKey: 'a', text: 'conteúdo visível' },
    ]);
    live = result.editorState;
    return { ok: true, changed: result.changed };
  });

  const sync = syncDocumentEditorExternalMutationsBeforeSave();
  assert.equal(sync.ok, true);
  assert.equal(sync.changed, true);
  assert.equal(plain(live), 'conteúdo visível');

  const snapshot = freezeDocumentModelSaveSnapshot({
    variables: {},
    sections: [{ data: [{ type: 'PARAGRAPH', text: plain(live) }] }],
  });
  const serialized = serializeDocumentModelData(snapshot);
  assert.equal(serialized.includes('conteúdo visível'), true);
  assert.equal(serialized.includes('antigo'), false);
  const hash = hashDocumentModelDataSync(snapshot);
  assert.equal(hash.length, 64);
  unregister();

  const persist = readRel(
    '../../modals/ModalEditDocumentModel/hooks/useEditDocumentModel.tsx',
  );
  const persistFn = persist.slice(
    persist.indexOf('const saveDocumentModel'),
    persist.indexOf('const persistDocumentModel'),
  );
  assert.equal(
    persistFn.indexOf('syncDocumentEditorExternalMutationsBeforeSave') <
      persistFn.indexOf('prepareDocumentModelSaveSnapshot'),
    true,
  );
  assert.equal(
    persistFn.indexOf('prepareDocumentModelSaveSnapshot') <
      persistFn.indexOf('mutateAsync'),
    true,
  );
});

run('V2 sync-before-save lê DOM antes do flush do domObserver', () => {
  const ext = readRel(
    '../editor-v2/integration/external-edit/v2-external-edit-extension.ts',
  );
  const syncNowStart = ext.indexOf('const syncNow =');
  const snapshotRead = ext.indexOf('const snapshot = readDomSnapshot()', syncNowStart);
  const syncFrom = ext.indexOf('syncFromSnapshot(snapshot)', syncNowStart);
  const flushAfter = ext.indexOf('flushDomObserver()', syncNowStart);
  assert.ok(snapshotRead > syncNowStart);
  assert.ok(syncFrom > snapshotRead);
  assert.ok(flushAfter > syncFrom);
});

run('V2 residual: external mutation → Save → edição manual → segundo Save persiste', () => {
  const original = buildModel([paragraph('el-a', 'texto antigo')]);
  let pmState = stateFromModel(original);
  const selection = createSectionSelection('section-body');
  const baseline = projectEditorSlice(original, selection);

  const unregister = registerV2ExternalEditSync(() => {
    const tr = createProseMirrorExternalTextTransaction(pmState, [
      { blockId: 'el-a', text: 'texto corrigido' },
    ]);
    if (!tr || !tr.docChanged) return { ok: true, changed: false };
    pmState = pmState.apply(tr);
    return { ok: true, changed: true };
  });

  const sync = syncDocumentEditorExternalMutationsBeforeSave();
  assert.equal(sync.ok, true);
  assert.equal(sync.changed, true);

  const firstPlan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: selection,
    baselineProjection: baseline,
    tipTapDoc: pmState.doc.toJSON(),
  });
  assert.equal(firstPlan.type, 'patch');
  if (firstPlan.type !== 'patch') throw new Error('expected patch');
  assert.equal(
    firstPlan.candidate.sections[0].children!['section-body'][0].text,
    'texto corrigido',
  );

  const savedOriginal = firstPlan.candidate;
  const persistedBaseline = firstPlan.built.editedProjected;

  const manualTr = createProseMirrorExternalTextTransaction(pmState, [
    { blockId: 'el-a', text: 'texto manual novo' },
  ]);
  assert.ok(manualTr);
  pmState = pmState.apply(manualTr!);

  const secondPlan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: savedOriginal,
    selectedItem: selection,
    baselineProjection: persistedBaseline,
    tipTapDoc: pmState.doc.toJSON(),
  });
  assert.equal(secondPlan.type, 'patch');
  if (secondPlan.type !== 'patch') throw new Error('expected patch');
  assert.equal(
    secondPlan.candidate.sections[0].children!['section-body'][0].text,
    'texto manual novo',
  );
  assert.equal(
    secondPlan.candidate.sections[0].children!['section-body'][0].text.includes(
      'antigo',
    ),
    false,
  );

  unregister();
});

run('V2 residual: external → Save → nova external → Save persiste', () => {
  const original = buildModel([paragraph('el-a', 'um dois')]);
  let pmState = stateFromModel(original);
  const selection = createSectionSelection('section-body');
  let baseline = projectEditorSlice(original, selection);
  let savedOriginal = original;

  const applyExternal = (text: string) => {
    const tr = createProseMirrorExternalTextTransaction(pmState, [
      { blockId: 'el-a', text },
    ]);
    if (!tr || !tr.docChanged) return { ok: true, changed: false };
    pmState = pmState.apply(tr);
    return { ok: true, changed: true };
  };

  const unregister = registerV2ExternalEditSync(() =>
    applyExternal('um dois três'),
  );
  assert.equal(syncDocumentEditorExternalMutationsBeforeSave().changed, true);

  const firstPlan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: savedOriginal,
    selectedItem: selection,
    baselineProjection: baseline,
    tipTapDoc: pmState.doc.toJSON(),
  });
  assert.equal(firstPlan.type, 'patch');
  if (firstPlan.type !== 'patch') throw new Error('expected patch');
  savedOriginal = firstPlan.candidate;
  baseline = firstPlan.built.editedProjected;

  unregister();
  const unregister2 = registerV2ExternalEditSync(() =>
    applyExternal('um dois três quatro'),
  );
  assert.equal(syncDocumentEditorExternalMutationsBeforeSave().changed, true);

  const secondPlan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: savedOriginal,
    selectedItem: selection,
    baselineProjection: baseline,
    tipTapDoc: pmState.doc.toJSON(),
  });
  assert.equal(secondPlan.type, 'patch');
  if (secondPlan.type !== 'patch') throw new Error('expected patch');
  assert.equal(
    secondPlan.candidate.sections[0].children!['section-body'][0].text,
    'um dois três quatro',
  );
  unregister2();
});

run('V2 markPersisted remonta editor após persistência', () => {
  const session = readRel('../editor-v2/integration/DocumentEditorV2Session.tsx');
  const markPersisted = session.slice(
    session.indexOf('const markPersisted'),
    session.indexOf('const shouldBlockOfficialSave'),
  );
  assert.equal(markPersisted.includes('setRemountKey'), true);
});

run('V2 external reconcile marca dirty e beforeinput distingue digitação', () => {
  const view = readRel('../editor-v2/integration/DocumentEditorV2SectionView.tsx');
  assert.equal(view.includes('onExternalReconcile'), true);
  assert.equal(view.includes('beforeinput'), true);
  assert.equal(view.includes('userInputPendingRef'), true);
});

console.log('\nExternal mutation sync: ok');
