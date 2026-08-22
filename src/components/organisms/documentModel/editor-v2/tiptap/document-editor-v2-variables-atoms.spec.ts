/**
 * Fase 4C — tokens de variável e cards de atoms (EditorState, sem React).
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/editor-v2/tiptap/document-editor-v2-variables-atoms.spec.ts
 */
import assert from 'assert';

import { getSchema } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import { NodeSelection, TextSelection, EditorState } from '@tiptap/pm/state';
import {
  DocModelPageOrientation,
  IDocumentModelData,
  IDocumentModelElement,
} from 'core/interfaces/api/IDocumentModel';
import {
  DocumentSectionChildrenTypeEnum,
  DocumentSectionTypeEnum,
  InlineStyleTypeEnum,
} from 'project/enum/document-model.enum';

import {
  fromDocumentEditorState,
  isAtomBlock,
  isCaptionBlock,
  persistJson,
  toDocumentEditorState,
} from '../adapter';
import {
  atomVisualLabel,
  classifyAtomType,
  IMAGE_THUMBNAIL_STRATEGY,
} from '../domain/atom-visual';
import { captionChromeLabel } from '../domain/caption-block';
import { resolveVariablePresentation } from '../domain/variable-token';
import { shouldBlockOfficialSave } from '../integration/document-editor-v2-session';
import { resolveActiveBlock } from './apply-block-format';
import {
  applyInlineColor,
  applyInlineFontSize,
  applyInlineStyle,
  resolveTextFormatToolbarState,
} from './apply-text-format';
import { createDocumentEditorExtensions } from './extensions/create-document-editor-extensions';
import { fromTipTapState } from './from-tiptap-state';
import { serializeTipTapDoc } from './schema';
import { applyStructuralSplit } from './structural-join';
import { toTipTapState } from './to-tiptap-state';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

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

function modelWithChildren(
  children: IDocumentModelElement[],
  variables: IDocumentModelData['variables'] = [
    { type: 'NOME_DA_EMPRESA', label: 'Nome da Empresa' },
  ],
): IDocumentModelData {
  return {
    variables,
    sections: [
      {
        data: [
          {
            id: 'section-body',
            type: DocumentSectionTypeEnum.SECTION,
            hasChildren: true,
          },
        ],
        children: { 'section-body': children },
      },
    ],
  };
}

const schema = getSchema(createDocumentEditorExtensions());

function stateFromModel(model: IDocumentModelData): EditorState {
  const json = serializeTipTapDoc(toTipTapState(toDocumentEditorState(model)));
  return EditorState.create({
    schema,
    doc: Node.fromJSON(schema, json),
  });
}

function stateFromChildren(
  children: IDocumentModelElement[],
  variables?: IDocumentModelData['variables'],
) {
  return stateFromModel(modelWithChildren(children, variables));
}

function findBlockPos(doc: Node, id: string): { pos: number; node: Node } {
  let pos = -1;
  let found: Node | undefined;
  doc.descendants((node, nodePos) => {
    if (
      (node.type.name === 'docParagraph' ||
        node.type.name === 'docBullet' ||
        node.type.name === 'docHeading' ||
        node.type.name === 'docCaption' ||
        node.type.name === 'docAtom') &&
      node.attrs.id === id
    ) {
      pos = nodePos;
      found = node;
      return false;
    }
  });
  if (pos < 0 || !found) throw new Error(`block ${id} not found`);
  return { pos, node: found };
}

function findVariablePos(
  doc: Node,
  type: string,
): { pos: number; node: Node } {
  let pos = -1;
  let found: Node | undefined;
  doc.descendants((node, nodePos) => {
    if (node.type.name === 'docVariable' && node.attrs.type === type) {
      pos = nodePos;
      found = node;
      return false;
    }
  });
  if (pos < 0 || !found) throw new Error(`variable ${type} not found`);
  return { pos, node: found };
}

function restore(state: EditorState) {
  return fromDocumentEditorState(fromTipTapState(state.doc.toJSON()));
}

function childrenOf(model: IDocumentModelData) {
  return model.sections[0].children!['section-body'];
}

function countVariables(doc: Node, type?: string) {
  let count = 0;
  doc.descendants((node) => {
    if (node.type.name !== 'docVariable') return;
    if (!type || node.attrs.type === type) count += 1;
  });
  return count;
}

run('1. ??NOME_DA_EMPRESA?? → token visual docVariable', () => {
  const state = stateFromChildren([
    paragraph('p-1', 'Empresa: ??NOME_DA_EMPRESA??.'),
  ]);
  const token = findVariablePos(state.doc, 'NOME_DA_EMPRESA');
  assert.equal(token.node.type.name, 'docVariable');
  assert.equal(token.node.attrs.label, 'Nome da Empresa');
  assert.equal(token.node.attrs.unknown, false);
  assert.equal(state.doc.textBetween(0, state.doc.content.size), 'Empresa: .');
});

run('2. label real do catálogo', () => {
  assert.deepStrictEqual(
    resolveVariablePresentation('NOME_DA_EMPRESA', [
      { type: 'NOME_DA_EMPRESA', label: 'Nome da Empresa' },
    ]),
    {
      type: 'NOME_DA_EMPRESA',
      label: 'Nome da Empresa',
      unknown: false,
      token: '??NOME_DA_EMPRESA??',
    },
  );
});

run('3. fallback para type quando não há label', () => {
  assert.equal(
    resolveVariablePresentation('NOME_DA_EMPRESA', [
      { type: 'NOME_DA_EMPRESA', label: '' },
    ]).label,
    'NOME_DA_EMPRESA',
  );
});

run('4. variável desconhecida vira token unknown', () => {
  const state = stateFromChildren([
    paragraph('p-1', 'X ??VAR_NAO_CADASTRADA?? Y'),
  ]);
  const token = findVariablePos(state.doc, 'VAR_NAO_CADASTRADA');
  assert.equal(token.node.attrs.label, 'VAR_NAO_CADASTRADA');
  assert.equal(token.node.attrs.unknown, true);
});

run('5. roundtrip sem edição permanece ??VAR??', () => {
  const model = modelWithChildren([
    paragraph('p-1', 'Empresa: ??NOME_DA_EMPRESA??.'),
  ]);
  const restored = restore(stateFromModel(model));
  assert.deepStrictEqual(persistJson(restored), persistJson(model));
});

run('6. id vizinho intacto', () => {
  const model = modelWithChildren([
    paragraph('p-keep', 'Antes ??NOME_DA_EMPRESA?? depois'),
    paragraph('p-next', 'Vizinho'),
  ]);
  const restored = childrenOf(restore(stateFromModel(model)));
  assert.equal(restored[0].id, 'p-keep');
  assert.equal(restored[1].id, 'p-next');
});

run('7. bold antes/depois não corrompe o token', () => {
  const model = modelWithChildren([
    paragraph('p-1', 'AA??NOME_DA_EMPRESA??BB', {
      inlineStyleRangeBlock: [
        [{ offset: 0, length: 2, style: InlineStyleTypeEnum.BOLD }],
      ],
    }),
  ]);
  const restored = childrenOf(restore(stateFromModel(model)))[0];
  assert.equal(restored.text, 'AA??NOME_DA_EMPRESA??BB');
  assert.equal(restored.inlineStyleRangeBlock?.[0][0].style, 'BOLD');
  assert.equal(restored.inlineStyleRangeBlock?.[0][0].offset, 0);
  assert.equal(restored.inlineStyleRangeBlock?.[0][0].length, 2);
});

run('8. COLOR antes/depois não corrompe', () => {
  const model = modelWithChildren([
    paragraph('p-1', 'AA??NOME_DA_EMPRESA??BB', {
      inlineStyleRangeBlock: [
        [
          {
            offset: 0,
            length: 2,
            style: InlineStyleTypeEnum.COLOR,
            value: '#FF0000',
          },
        ],
      ],
    }),
  ]);
  assert.equal(
    childrenOf(restore(stateFromModel(model)))[0].text,
    'AA??NOME_DA_EMPRESA??BB',
  );
});

run('9. FONTSIZE antes/depois não corrompe', () => {
  const model = modelWithChildren([
    paragraph('p-1', 'AA??NOME_DA_EMPRESA??BB', {
      inlineStyleRangeBlock: [
        [
          {
            offset: 22,
            length: 2,
            style: InlineStyleTypeEnum.FONTSIZE,
            value: '14',
          },
        ],
      ],
    }),
  ]);
  const restored = childrenOf(restore(stateFromModel(model)))[0];
  assert.equal(restored.text, 'AA??NOME_DA_EMPRESA??BB');
  assert.equal(restored.inlineStyleRangeBlock?.[0][0].value, '14');
});

run('10. link antes/depois não quebra', () => {
  const model = modelWithChildren([
    paragraph('p-1', 'AA??NOME_DA_EMPRESA??BB', {
      entityRangeBlock: [
        [
          {
            offset: 0,
            length: 2,
            data: {
              type: 'LINK',
              mutability: 'MUTABLE',
              data: { url: 'https://example.com', targetOption: '_blank' },
            },
          },
        ],
      ],
    }),
  ]);
  const restored = childrenOf(restore(stateFromModel(model)))[0];
  assert.equal(restored.text, 'AA??NOME_DA_EMPRESA??BB');
  assert.equal(restored.entityRangeBlock?.[0]?.[0]?.data?.type, 'LINK');
});

run('11. Delete remove o token inteiro', () => {
  let state = stateFromChildren([
    paragraph('p-1', 'AA??NOME_DA_EMPRESA??BB'),
  ]);
  const found = findVariablePos(state.doc, 'NOME_DA_EMPRESA');
  state = state.apply(state.tr.delete(found.pos, found.pos + found.node.nodeSize));
  assert.equal(countVariables(state.doc, 'NOME_DA_EMPRESA'), 0);
  assert.equal(childrenOf(restore(state))[0].text, 'AABB');
});

run('12. Backspace remove o token inteiro', () => {
  let state = stateFromChildren([
    paragraph('p-1', 'AA??NOME_DA_EMPRESA??BB'),
  ]);
  const found = findVariablePos(state.doc, 'NOME_DA_EMPRESA');
  state = state.apply(
    state.tr.setSelection(
      TextSelection.create(state.doc, found.pos + found.node.nodeSize),
    ),
  );
  state = state.apply(state.tr.delete(found.pos, found.pos + found.node.nodeSize));
  assert.equal(childrenOf(restore(state))[0].text, 'AABB');
});

run('13. Enter não parte o token', () => {
  let state = stateFromChildren([
    paragraph('p-1', 'AA??NOME_DA_EMPRESA??BB'),
  ]);
  const found = findVariablePos(state.doc, 'NOME_DA_EMPRESA');
  state = state.apply(
    state.tr.setSelection(TextSelection.create(state.doc, found.pos)),
  );
  const split = applyStructuralSplit(state);
  const texts = childrenOf(restore(split.state)).map((item) => item.text);
  texts.forEach((text) => {
    if (text.includes('NOME_DA_EMPRESA')) {
      assert.ok(text.includes('??NOME_DA_EMPRESA??'));
      assert.equal((text.match(/\?\?/g) || []).length % 2, 0);
    }
  });
  assert.equal(countVariables(split.state.doc, 'NOME_DA_EMPRESA'), 1);
});

run('14. seleção parcial expande para o token inteiro', () => {
  let state = stateFromChildren([
    paragraph('p-1', 'AA??NOME_DA_EMPRESA??BB'),
  ]);
  const found = findVariablePos(state.doc, 'NOME_DA_EMPRESA');
  state = state.apply(
    state.tr.setSelection(
      TextSelection.create(state.doc, found.pos, found.pos + 1),
    ),
  );
  const result = applyInlineStyle(state, InlineStyleTypeEnum.BOLD);
  assert.equal(result.ok, true);
  const restored = childrenOf(restore(result.state))[0];
  assert.equal(restored.text, 'AA??NOME_DA_EMPRESA??BB');
  const bold = restored.inlineStyleRangeBlock?.[0].find(
    (item) => item.style === InlineStyleTypeEnum.BOLD,
  );
  assert.ok(bold);
  assert.equal(bold?.offset, 2);
  assert.equal(bold?.length, '??NOME_DA_EMPRESA??'.length);
});

run('15. copy/paste preserva ??VAR??', () => {
  let state = stateFromChildren([
    paragraph('p-1', 'AA??NOME_DA_EMPRESA??BB'),
    paragraph('p-2', 'Z'),
  ]);
  const found = findVariablePos(state.doc, 'NOME_DA_EMPRESA');
  const slice = state.doc.slice(found.pos, found.pos + found.node.nodeSize);
  const target = findBlockPos(state.doc, 'p-2');
  state = state.apply(
    state.tr.replace(target.pos + 1, target.pos + 1 + 1, slice),
  );
  const restored = childrenOf(restore(state));
  assert.equal(restored[0].text, 'AA??NOME_DA_EMPRESA??BB');
  assert.equal(restored[1].text, '??NOME_DA_EMPRESA??');
});

run('16. variável em BULLET', () => {
  const model = modelWithChildren([
    {
      id: 'b-1',
      type: DocumentSectionChildrenTypeEnum.BULLET,
      text: 'Item ??NOME_DA_EMPRESA??',
      level: 0,
    },
  ]);
  const restored = childrenOf(restore(stateFromModel(model)))[0];
  assert.equal(restored.type, 'BULLET');
  assert.equal(restored.text, 'Item ??NOME_DA_EMPRESA??');
});

run('17. variável em BULLET_SPACE', () => {
  const model = modelWithChildren([
    {
      id: 'bs-1',
      type: DocumentSectionChildrenTypeEnum.BULLET_SPACE,
      text: 'Espaço ??NOME_DA_EMPRESA??',
    },
  ]);
  const restored = childrenOf(restore(stateFromModel(model)))[0];
  assert.equal(restored.type, 'BULLET_SPACE');
  assert.equal(restored.text, 'Espaço ??NOME_DA_EMPRESA??');
});

run('18. variável em heading', () => {
  const model = modelWithChildren([
    {
      id: 'h-1',
      type: DocumentSectionChildrenTypeEnum.H2,
      text: 'Título ??NOME_DA_EMPRESA??',
    },
  ]);
  const restored = childrenOf(restore(stateFromModel(model)))[0];
  assert.equal(restored.type, 'H2');
  assert.equal(restored.text, 'Título ??NOME_DA_EMPRESA??');
});

run('19. só renderizar variável não muda o canonical', () => {
  const model = modelWithChildren([
    paragraph('p-1', 'Empresa: ??NOME_DA_EMPRESA??.'),
  ]);
  assert.deepStrictEqual(
    persistJson(restore(stateFromModel(model))),
    persistJson(model),
  );
  assert.equal(
    shouldBlockOfficialSave({ surface: 'v2', v2LocalDirty: false }),
    false,
  );
});

run('20. remoção da variável altera o conteúdo', () => {
  const model = modelWithChildren([
    paragraph('p-1', 'Empresa: ??NOME_DA_EMPRESA??.'),
  ]);
  let state = stateFromModel(model);
  const found = findVariablePos(state.doc, 'NOME_DA_EMPRESA');
  state = state.apply(state.tr.delete(found.pos, found.pos + found.node.nodeSize));
  assert.notDeepStrictEqual(persistJson(restore(state)), persistJson(model));
  assert.equal(childrenOf(restore(state))[0].text, 'Empresa: .');
});

run('21. BREAK → visual próprio', () => {
  const state = stateFromChildren([
    {
      id: 'el-break',
      type: DocumentSectionChildrenTypeEnum.BREAK,
      text: '',
    },
  ]);
  const atom = findBlockPos(state.doc, 'el-break');
  assert.equal(atom.node.attrs.atomType, 'BREAK');
  assert.equal(atomVisualLabel('BREAK'), 'Quebra de página');
  assert.equal(classifyAtomType('BREAK'), 'pagination');
});

run('22. SECTION_BREAK portrait', () => {
  const model = modelWithChildren([
    {
      id: 'el-sb',
      type: DocumentSectionChildrenTypeEnum.SECTION_BREAK,
      text: '',
      orientation: DocModelPageOrientation.PORTRAIT,
    },
  ]);
  const restored = childrenOf(restore(stateFromModel(model)))[0];
  assert.equal(restored.type, 'SECTION_BREAK');
  assert.equal(restored.orientation, 'portrait');
  assert.equal(
    atomVisualLabel('SECTION_BREAK', { orientation: 'portrait' }),
    'Quebra de seção — Retrato',
  );
});

run('23. SECTION_BREAK landscape', () => {
  assert.equal(
    atomVisualLabel('SECTION_BREAK', { orientation: 'landscape' }),
    'Quebra de seção — Paisagem',
  );
  const model = modelWithChildren([
    {
      id: 'el-sb',
      type: DocumentSectionChildrenTypeEnum.SECTION_BREAK,
      text: '',
      orientation: DocModelPageOrientation.LANDSCAPE,
    },
  ]);
  assert.equal(
    childrenOf(restore(stateFromModel(model)))[0].orientation,
    'landscape',
  );
});

run('24. IMAGE card sem mutar url (sem miniatura nesta fase)', () => {
  assert.equal(IMAGE_THUMBNAIL_STRATEGY, 'icon-card');
  const model = modelWithChildren([
    {
      id: 'el-image',
      type: DocumentSectionChildrenTypeEnum.IMAGE,
      text: '',
      url: '/x.png',
      width: 80,
    },
  ]);
  const restored = childrenOf(restore(stateFromModel(model)))[0];
  assert.equal(restored.url, '/x.png');
  assert.equal(restored.width, 80);
  assert.equal(classifyAtomType('IMAGE'), 'media');
});

run('25. TABLE_VERSION_CONTROL', () => {
  assert.equal(
    atomVisualLabel('TABLE_VERSION_CONTROL'),
    'Tabela — Controle de versões',
  );
  const model = modelWithChildren([
    {
      id: 'el-tvc',
      type: DocumentSectionChildrenTypeEnum.TABLE_VERSION_CONTROL,
      text: '',
    },
  ]);
  const blocks = toDocumentEditorState(restore(stateFromModel(model))).groups[0]
    .sections[0].blocks;
  assert.ok(isAtomBlock(blocks[0]));
  assert.equal(blocks[0].type, 'TABLE_VERSION_CONTROL');
});

run('26. PROFESSIONAL', () => {
  assert.equal(atomVisualLabel('PROFESSIONAL'), 'Lista de profissionais');
  const model = modelWithChildren([
    {
      id: 'el-pro',
      type: DocumentSectionChildrenTypeEnum.PROFESSIONAL,
      text: '',
    },
  ]);
  assert.equal(childrenOf(restore(stateFromModel(model)))[0].type, 'PROFESSIONAL');
});

run('27. unknown atom', () => {
  assert.equal(
    atomVisualLabel('FUTURE_UNKNOWN_TYPE'),
    'Elemento não suportado: FUTURE_UNKNOWN_TYPE',
  );
  assert.equal(classifyAtomType('FUTURE_UNKNOWN_TYPE'), 'unknown');
});

run('28. label do catálogo vence o fallback', () => {
  assert.equal(
    atomVisualLabel('TABLE_GSE', null, 'Grupo Similar de Exposição'),
    'Grupo Similar de Exposição',
  );
});

run('29. source de atom intacto', () => {
  const model = modelWithChildren([
    {
      id: 'el-image',
      type: DocumentSectionChildrenTypeEnum.IMAGE,
      text: '',
      url: '/keep.png',
      width: 40,
      removeWithAllValidVars: ['X'],
    },
  ]);
  assert.deepStrictEqual(
    persistJson(restore(stateFromModel(model))),
    persistJson(model),
  );
});

run('30. id de atom intacto', () => {
  const model = modelWithChildren([
    paragraph('p-1', 'Antes'),
    {
      id: 'el-keep',
      type: DocumentSectionChildrenTypeEnum.BREAK,
      text: '',
    },
  ]);
  assert.equal(childrenOf(restore(stateFromModel(model)))[1].id, 'el-keep');
});

run('31. atom não aceita texto interno', () => {
  const state = stateFromChildren([
    {
      id: 'el-break',
      type: DocumentSectionChildrenTypeEnum.BREAK,
      text: '',
    },
  ]);
  const atom = findBlockPos(state.doc, 'el-break');
  assert.equal(atom.node.isTextblock, false);
  assert.equal(atom.node.type.spec.atom, true);
  assert.equal(atom.node.content.size, 0);
});

run('32. atom não aceita merge', () => {
  const state = stateFromChildren([
    paragraph('p-1', 'Antes'),
    {
      id: 'el-break',
      type: DocumentSectionChildrenTypeEnum.BREAK,
      text: '',
    },
  ]);
  const paragraphPos = findBlockPos(state.doc, 'p-1');
  const atEnd = state.apply(
    state.tr.setSelection(
      TextSelection.create(
        state.doc,
        paragraphPos.pos + 1 + paragraphPos.node.content.size,
      ),
    ),
  );
  assert.equal(resolveActiveBlock(atEnd).kind, 'convertible');
  const atom = findBlockPos(atEnd.doc, 'el-break');
  const selected = atEnd.apply(
    atEnd.tr.setSelection(NodeSelection.create(atEnd.doc, atom.pos)),
  );
  assert.equal(resolveActiveBlock(selected).kind, 'atom');
});

run('33. atom não aceita formatação textual', () => {
  let state = stateFromChildren([
    {
      id: 'el-break',
      type: DocumentSectionChildrenTypeEnum.BREAK,
      text: '',
    },
  ]);
  const atom = findBlockPos(state.doc, 'el-break');
  state = state.apply(
    state.tr.setSelection(NodeSelection.create(state.doc, atom.pos)),
  );
  const toolbar = resolveTextFormatToolbarState(state);
  assert.equal(toolbar.atom, true);
  assert.equal(toolbar.blockEnabled, false);
  assert.equal(toolbar.inlineEnabled, false);
  assert.equal(applyInlineStyle(state, InlineStyleTypeEnum.BOLD).ok, false);
});

run('34. render de atom não muda o canonical', () => {
  const model = modelWithChildren([
    {
      id: 'el-pro',
      type: DocumentSectionChildrenTypeEnum.PROFESSIONAL,
      text: '',
    },
  ]);
  assert.deepStrictEqual(
    persistJson(restore(stateFromModel(model))),
    persistJson(model),
  );
});

run('35. unknown roundtrip lossless', () => {
  const model = modelWithChildren([
    paragraph('p-1', 'Antes'),
    { id: 'el-future', type: 'FUTURE_UNKNOWN_TYPE', text: '', url: '/keep' },
    paragraph('p-2', 'Depois'),
  ]);
  assert.deepStrictEqual(
    persistJson(restore(stateFromModel(model))),
    persistJson(model),
  );
});

run('36. PARAGRAPH_TABLE continua editável', () => {
  const model = modelWithChildren([
    {
      id: 'el-pt',
      type: DocumentSectionChildrenTypeEnum.PARAGRAPH_TABLE,
      text: 'Tabela 1 — Riscos',
    },
  ]);
  const state = stateFromModel(model);
  const block = findBlockPos(state.doc, 'el-pt');
  assert.equal(block.node.type.name, 'docCaption');
  assert.equal(captionChromeLabel('PARAGRAPH_TABLE'), 'Tabela');
  const editorState = toDocumentEditorState(restore(state));
  assert.ok(isCaptionBlock(editorState.groups[0].sections[0].blocks[0]));
  let selected = state.apply(
    state.tr.setSelection(
      TextSelection.create(state.doc, block.pos + 1, block.pos + 1 + 7),
    ),
  );
  const result = applyInlineStyle(selected, InlineStyleTypeEnum.BOLD);
  assert.equal(result.ok, true);
  const restored = childrenOf(restore(result.state))[0];
  assert.equal(restored.type, 'PARAGRAPH_TABLE');
  assert.equal(restored.text, 'Tabela 1 — Riscos');
  assert.equal(restored.inlineStyleRangeBlock?.[0][0].style, 'BOLD');
});

run('37. PARAGRAPH_FIGURE continua editável', () => {
  const model = modelWithChildren([
    {
      id: 'el-pf',
      type: DocumentSectionChildrenTypeEnum.PARAGRAPH_FIGURE,
      text: 'Figura 1',
    },
  ]);
  const restored = childrenOf(restore(stateFromModel(model)))[0];
  assert.equal(restored.type, 'PARAGRAPH_FIGURE');
  assert.equal(restored.text, 'Figura 1');
  assert.equal(captionChromeLabel('PARAGRAPH_FIGURE'), 'Imagem');
});

run('38. LEGEND continua editável', () => {
  const model = modelWithChildren([
    {
      id: 'el-lg',
      type: DocumentSectionChildrenTypeEnum.LEGEND,
      text: 'Fonte: empresa',
    },
  ]);
  const restored = childrenOf(restore(stateFromModel(model)))[0];
  assert.equal(restored.type, 'LEGEND');
  assert.equal(restored.text, 'Fonte: empresa');
  assert.equal(captionChromeLabel('LEGEND'), 'Legenda');
});

run('39. captions preservam ranges', () => {
  const model = modelWithChildren([
    {
      id: 'el-pt',
      type: DocumentSectionChildrenTypeEnum.PARAGRAPH_TABLE,
      text: 'Tabela ??NOME_DA_EMPRESA??',
      inlineStyleRangeBlock: [
        [{ offset: 0, length: 7, style: InlineStyleTypeEnum.ITALIC }],
      ],
    },
  ]);
  const restored = childrenOf(restore(stateFromModel(model)))[0];
  assert.equal(restored.text, 'Tabela ??NOME_DA_EMPRESA??');
  assert.equal(restored.inlineStyleRangeBlock?.[0][0].style, 'ITALIC');
  assert.equal(restored.type, 'PARAGRAPH_TABLE');
});

run('toolbar: caption habilita controles textuais e bloqueia tipo', () => {
  let state = stateFromChildren([
    {
      id: 'el-pt',
      type: DocumentSectionChildrenTypeEnum.PARAGRAPH_TABLE,
      text: 'Tabela 1',
    },
  ]);
  const block = findBlockPos(state.doc, 'el-pt');
  state = state.apply(
    state.tr.setSelection(TextSelection.create(state.doc, block.pos + 1)),
  );
  const active = resolveActiveBlock(state);
  assert.equal(active.kind, 'caption');
  assert.equal(active.convertible, false);
  const toolbar = resolveTextFormatToolbarState(state);
  assert.equal(toolbar.blockEnabled, true);
  assert.equal(toolbar.atom, false);
});

run('toolbar: unknown atom desabilita controles', () => {
  let state = stateFromChildren([
    { id: 'el-x', type: 'FUTURE_UNKNOWN_TYPE', text: '' },
  ]);
  const atom = findBlockPos(state.doc, 'el-x');
  state = state.apply(
    state.tr.setSelection(NodeSelection.create(state.doc, atom.pos)),
  );
  assert.equal(resolveTextFormatToolbarState(state).blockEnabled, false);
  assert.equal(resolveTextFormatToolbarState(state).inlineEnabled, false);
});

run('COLOR/FONTSIZE ao redor do token via comando', () => {
  let state = stateFromChildren([
    paragraph('p-1', 'AA??NOME_DA_EMPRESA??BB'),
  ]);
  const block = findBlockPos(state.doc, 'p-1');
  state = state.apply(
    state.tr.setSelection(
      TextSelection.create(state.doc, block.pos + 1, block.pos + 3),
    ),
  );
  state = applyInlineColor(state, '#0000FF').state;
  state = applyInlineFontSize(state, 12).state;
  const restored = childrenOf(restore(state))[0];
  assert.equal(restored.text, 'AA??NOME_DA_EMPRESA??BB');
});

console.log('\nFase 4C variables/atoms: ok');
