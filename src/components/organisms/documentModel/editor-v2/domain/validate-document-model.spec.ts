/**
 * Validator de variáveis — diagnóstico 5B e compatibilidade V1.
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/editor-v2/domain/validate-document-model.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { getSchema } from '@tiptap/core';
import {
  IDocumentModelData,
  IDocumentModelElement,
} from 'core/interfaces/api/IDocumentModel';
import {
  DocumentSectionChildrenTypeEnum,
  DocumentSectionTypeEnum,
  InlineStyleTypeEnum,
} from 'project/enum/document-model.enum';

import { persistJson, toDocumentEditorState } from '../adapter';
import { createDocumentEditorExtensions } from '../tiptap/extensions/create-document-editor-extensions';
import { serializeTipTapDoc } from '../tiptap/schema';
import { toTipTapState } from '../tiptap/to-tiptap-state';
import { canonicalDiff } from './canonical-diff';
import { createSectionSelection, projectEditorSlice } from './document-editor-slice';
import { buildDocumentEditorCandidate } from './build-document-editor-candidate';
import { VARIABLE_CANONICAL_RE } from './variable-token';
import {
  inventoryDocumentModelVariableTokens,
  leftoverAsciiVariableCheck,
  listOutOfBoundRanges,
  scanVariableTokenMarks,
  validateDocumentModelCandidate,
} from './validate-document-model';

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

function modelWith(
  body: IDocumentModelElement[],
  other: IDocumentModelElement[] = [paragraph('el-other', 'Outra section')],
): IDocumentModelData {
  return {
    variables: [{ type: 'NOME_DA_EMPRESA', label: 'Nome da Empresa' }],
    sections: [
      {
        data: [
          {
            id: 'section-body',
            type: DocumentSectionTypeEnum.SECTION,
            hasChildren: true,
          },
          {
            id: 'section-other',
            type: DocumentSectionTypeEnum.SECTION,
            hasChildren: true,
          },
        ],
        children: {
          'section-body': body,
          'section-other': other,
        },
      },
    ],
  };
}

const schema = getSchema(createDocumentEditorExtensions());

function tipTapFromModel(model: IDocumentModelData) {
  return serializeTipTapDoc(toTipTapState(toDocumentEditorState(model)));
}

const OFFICIAL_ACCENTED = [
  'MISSÃO_DA_EMPRESA',
  'VISÃO_DA_EMPRESA',
  'SISTEMAS_DE_GESTÃO_EXISTENTES',
  'DESCRIÇÃO_DO_AMBIENTE',
  'DESCRIÇÃO_GERAL_DO_AMBIENTE',
];

run('regra 5A leftover+[A-Za-z0-9_] rejeita tokens oficiais com acento', () => {
  OFFICIAL_ACCENTED.forEach((type) => {
    const token = `??${type}??`;
    assert.equal(
      leftoverAsciiVariableCheck(`A empresa ${token} segue.`),
      true,
      `esperado leftover ascii em ${token}`,
    );
    assert.equal(new RegExp(VARIABLE_CANONICAL_RE.source).test(token), false);
  });
});

run('1. ??NOME_DA_EMPRESA?? válido', () => {
  const result = validateDocumentModelCandidate(
    modelWith([paragraph('el-a', 'Empresa ??NOME_DA_EMPRESA??')]),
  );
  assert.equal(result.ok, true);
});

run('2. múltiplos tokens na mesma linha', () => {
  const result = validateDocumentModelCandidate(
    modelWith([
      paragraph(
        'el-a',
        '??NOME_DA_EMPRESA?? em ??CIDADE_EMPRESA?? e ??UF_EMPRESA??',
      ),
    ]),
  );
  assert.equal(result.ok, true);
});

run('3. tokens consecutivos', () => {
  const result = validateDocumentModelCandidate(
    modelWith([paragraph('el-a', '??NOME_DA_EMPRESA????RAZAO_SOCIAL??')]),
  );
  assert.equal(result.ok, true);
});

run('4. token desconhecido mas completo', () => {
  const result = validateDocumentModelCandidate(
    modelWith([paragraph('el-a', 'X ??VAR_NAO_CADASTRADA?? Y')]),
  );
  assert.equal(result.ok, true);
  const inventory = inventoryDocumentModelVariableTokens(
    modelWith([paragraph('el-a', 'X ??VAR_NAO_CADASTRADA?? Y')]),
    ['NOME_DA_EMPRESA'],
  );
  assert.ok(
    inventory.some(
      (item) =>
        item.kind === 'complete-unknown' &&
        item.sequence === '??VAR_NAO_CADASTRADA??',
    ),
  );
});

run('5. token em bullet', () => {
  const result = validateDocumentModelCandidate(
    modelWith([
      {
        id: 'el-b',
        type: DocumentSectionChildrenTypeEnum.BULLET,
        text: 'Item ??NOME_DA_EMPRESA??',
        level: 0,
      },
    ]),
  );
  assert.equal(result.ok, true);
});

run('6. token em heading', () => {
  const result = validateDocumentModelCandidate(
    modelWith([
      {
        id: 'el-h',
        type: DocumentSectionChildrenTypeEnum.H2,
        text: 'Título ??NOME_DA_EMPRESA??',
      },
    ]),
  );
  assert.equal(result.ok, true);
});

run('7. token em caption', () => {
  const result = validateDocumentModelCandidate(
    modelWith([
      {
        id: 'el-c',
        type: DocumentSectionChildrenTypeEnum.LEGEND,
        text: 'Tabela ??NOME_DA_EMPRESA??',
      },
    ]),
  );
  assert.equal(result.ok, true);
});

run('8. texto comum com ?', () => {
  const result = validateDocumentModelCandidate(
    modelWith([paragraph('el-a', 'Valor em R$? Continua o texto.')]),
  );
  assert.equal(result.ok, true);
});

run('9. pergunta terminando com ?', () => {
  const result = validateDocumentModelCandidate(
    modelWith([paragraph('el-a', 'Qual o risco desta atividade?')]),
  );
  assert.equal(result.ok, true);
});

run('10. ??TOKEN? realmente corrompido', () => {
  const result = validateDocumentModelCandidate(
    modelWith([paragraph('el-a', 'Empresa ??NOME_DA_EMPRESA?')]),
  );
  assert.equal(result.ok, false);
  const error = result.errors.find((item) => item.code === 'invalid-variable-token');
  assert.ok(error);
  assert.equal(error?.elementId, 'el-a');
  assert.equal(error?.elementType, 'PARAGRAPH');
  assert.equal(typeof error?.offset, 'number');
  assert.ok(error?.fragment?.includes('??NOME_DA_EMPRESA?'));
  assert.ok(error?.path.includes('el-a'));
});

run('11. ?TOKEN?? realmente corrompido', () => {
  const result = validateDocumentModelCandidate(
    modelWith([paragraph('el-a', 'Empresa ?NOME_DA_EMPRESA??')]),
  );
  assert.equal(result.ok, false);
  const error = result.errors.find((item) => item.code === 'invalid-variable-token');
  assert.ok(error?.fragment?.includes('?NOME_DA_EMPRESA??'));
});

run('12. token legado preexistente untouched não bloqueia', () => {
  const original = modelWith(
    [paragraph('el-a', 'Editável')],
    [paragraph('el-other', 'Missão ??MISSÃO_DA_EMPRESA?? da empresa.')],
  );
  const candidate = persistJson(original);
  candidate.sections[0].children!['section-body'][0].text = 'Editável agora';
  const diff = canonicalDiff(original, candidate);
  assert.ok(diff.some((item) => item.path.includes('el-a')));
  assert.equal(
    diff.some((item) => item.path.includes('el-other')),
    false,
  );
  const result = validateDocumentModelCandidate(candidate, { original });
  assert.equal(result.ok, true);
});

run('12b. token oficial com acento é completo (não leftover)', () => {
  OFFICIAL_ACCENTED.forEach((type) => {
    const result = validateDocumentModelCandidate(
      modelWith([paragraph('el-a', `A empresa ??${type}?? segue.`)]),
    );
    assert.equal(result.ok, true, type);
    const marks = scanVariableTokenMarks(`??${type}??`);
    assert.deepStrictEqual(
      marks.map((item) => item.kind),
      ['complete'],
    );
  });
});

run('13. candidate que mutila token deve falhar', () => {
  const original = modelWith([
    paragraph('el-a', 'Empresa ??NOME_DA_EMPRESA??'),
  ]);
  const candidate = persistJson(original);
  candidate.sections[0].children!['section-body'][0].text =
    'Empresa ??NOME_DA_EMPRESA?';
  const result = validateDocumentModelCandidate(candidate, { original });
  assert.equal(result.ok, false);
  assert.ok(
    result.errors.some(
      (item) =>
        item.code === 'invalid-variable-token' && item.elementId === 'el-a',
    ),
  );
});

run('14. candidate que não toca construção preexistente não normaliza', () => {
  const original = modelWith(
    [paragraph('el-a', 'Novo texto')],
    [paragraph('el-other', 'Pergunta residual??')],
  );
  const candidate = persistJson(original);
  candidate.sections[0].children!['section-body'][0].text = 'Novo texto editado';
  const result = validateDocumentModelCandidate(candidate, { original });
  assert.equal(result.ok, true);
  assert.equal(
    candidate.sections[0].children!['section-other'][0].text,
    'Pergunta residual??',
  );
  assert.equal(
    leftoverAsciiVariableCheck(
      candidate.sections[0].children!['section-other'][0].text,
    ),
    true,
  );
});

run('15. validator error continua causando ZERO PATCH', () => {
  const original = modelWith([
    paragraph('el-a', 'Empresa ??NOME_DA_EMPRESA??'),
  ]);
  const edited = persistJson(projectEditorSlice(original, createSectionSelection('section-body')));
  edited.sections[0].children!['section-body'][0].text = 'Empresa ??NOME_DA_EMPRESA?';
  const built = buildDocumentEditorCandidate({
    originalModel: original,
    selectedItem: createSectionSelection('section-body'),
    tipTapDoc: tipTapFromModel(edited),
  });
  assert.equal(built.validation.ok, false);
  const persist = fs.readFileSync(
    path.join(
      __dirname,
      '../../../modals/ModalEditDocumentModel/hooks/useEditDocumentModel.tsx',
    ),
    'utf8',
  );
  const persistFn = persist.slice(
    persist.indexOf('const saveDocumentModel'),
    persist.indexOf('const persistDocumentModel'),
  );
  assert.ok(persistFn.indexOf("plan.type === 'abort'") < persistFn.indexOf('mutateAsync'));
  assert.ok(persistFn.indexOf('return false') < persistFn.indexOf('mutateAsync'));
  assert.equal(persistFn.includes('setDocumentModel(snapshot)'), true);
});

run('erro estruturado carrega path/element/offset/fragmento', () => {
  const result = validateDocumentModelCandidate(
    modelWith([
      {
        id: 'el-h',
        type: DocumentSectionChildrenTypeEnum.H1,
        text: 'Capítulo ??CAPITULO?',
      },
    ]),
  );
  const error = result.errors[0];
  assert.equal(error.code, 'invalid-variable-token');
  assert.ok(error.path.includes('el-h'));
  assert.equal(error.elementId, 'el-h');
  assert.equal(error.elementType, 'H1');
  assert.equal(error.offset, 'Capítulo '.length);
  assert.ok(error.fragment?.includes('??CAPITULO?'));
});

run('inventário classifica complete / incomplete / ? comum', () => {
  const inventory = inventoryDocumentModelVariableTokens(
    modelWith([
      paragraph(
        'el-a',
        '??NOME_DA_EMPRESA?? e ??MISSÃO_DA_EMPRESA??. Risco? ??TOKEN?',
      ),
    ]),
    ['NOME_DA_EMPRESA'],
  );
  assert.ok(inventory.some((item) => item.kind === 'complete-ascii'));
  assert.ok(inventory.some((item) => item.kind === 'complete-legacy'));
  assert.ok(inventory.some((item) => item.kind === 'incomplete'));
  assert.ok(inventory.some((item) => item.kind === 'plain-question'));
});

run('hardBreak / duas linhas: token fechado em uma linha segue válido', () => {
  const result = validateDocumentModelCandidate(
    modelWith([
      paragraph('el-a', 'Linha 1 ??NOME_DA_EMPRESA??\nLinha 2 segue.'),
    ]),
  );
  assert.equal(result.ok, true);
});

run('merge + candidate: legado em outra section não entra no diff', () => {
  const original = modelWith(
    [paragraph('el-a', 'A')],
    [paragraph('el-other', '??MISSÃO_DA_EMPRESA??')],
  );
  const edited = persistJson(projectEditorSlice(original, createSectionSelection('section-body')));
  edited.sections[0].children!['section-body'][0].text = 'A editado';
  const built = buildDocumentEditorCandidate({
    originalModel: original,
    selectedItem: createSectionSelection('section-body'),
    tipTapDoc: tipTapFromModel(edited),
  });
  assert.equal(built.validation.ok, true);
  assert.equal(
    built.diff.some((item) => item.path.includes('el-other')),
    false,
  );
  assert.equal(
    built.candidate.sections[0].children!['section-other'][0].text,
    '??MISSÃO_DA_EMPRESA??',
  );
});

const legacyOobRange = {
  offset: 449,
  length: 45,
  style: InlineStyleTypeEnum.BOLD,
};

const shortLine = 'x'.repeat(41);

run('range: 5A sem original ainda rejeita OOB', () => {
  const result = validateDocumentModelCandidate(
    modelWith([
      paragraph('el-legacy', shortLine, {
        inlineStyleRangeBlock: [[legacyOobRange]],
      }),
    ]),
  );
  assert.equal(result.ok, false);
  const error = result.errors.find((item) => item.code === 'invalid-range');
  assert.ok(error?.message.includes('offset=449'));
  assert.ok(error?.message.includes('length=45'));
  assert.ok(error?.message.includes('line=41'));
  assert.equal(error?.elementId, 'el-legacy');
  assert.equal(error?.elementType, 'PARAGRAPH');
  const hits = listOutOfBoundRanges(
    modelWith([
      paragraph('el-legacy', shortLine, {
        inlineStyleRangeBlock: [[legacyOobRange]],
      }),
    ]).sections[0].children!['section-body'][0],
  );
  assert.equal(hits[0].lineIndex, 0);
  assert.equal(hits[0].kind, 'inlineStyleRangeBlock');
  assert.equal(hits[0].textLength, shortLine.length);
});

run('1. range legado inválido untouched', () => {
  const original = modelWith(
    [paragraph('el-a', 'Editável')],
    [
      paragraph('el-other', shortLine, {
        inlineStyleRangeBlock: [[legacyOobRange]],
      }),
    ],
  );
  const candidate = persistJson(original);
  candidate.sections[0].children!['section-body'][0].text = 'Editável agora';
  const result = validateDocumentModelCandidate(candidate, { original });
  assert.equal(result.ok, true);
  assert.deepStrictEqual(
    candidate.sections[0].children!['section-other'][0].inlineStyleRangeBlock,
    [[legacyOobRange]],
  );
});

run('2. range válido untouched', () => {
  const original = modelWith([
    paragraph('el-a', 'ABCDE', {
      inlineStyleRangeBlock: [
        [{ offset: 0, length: 3, style: InlineStyleTypeEnum.ITALIC }],
      ],
    }),
  ]);
  const result = validateDocumentModelCandidate(persistJson(original), {
    original,
  });
  assert.equal(result.ok, true);
});

run('3. range válido após alteração de texto', () => {
  const original = modelWith([
    paragraph('el-a', 'Empresa', {
      inlineStyleRangeBlock: [
        [{ offset: 0, length: 7, style: InlineStyleTypeEnum.UNDERLINE }],
      ],
    }),
  ]);
  const candidate = persistJson(original);
  candidate.sections[0].children!['section-body'][0].text = 'Empresa X';
  candidate.sections[0].children!['section-body'][0].inlineStyleRangeBlock = [
    [{ offset: 0, length: 7, style: InlineStyleTypeEnum.UNDERLINE }],
  ];
  const result = validateDocumentModelCandidate(candidate, { original });
  assert.equal(result.ok, true);
});

run('4. range novo inválido no candidate → abort', () => {
  const original = modelWith([paragraph('el-a', 'Empresa')]);
  const candidate = persistJson(original);
  candidate.sections[0].children!['section-body'][0].inlineStyleRangeBlock = [
    [{ offset: 449, length: 45, style: InlineStyleTypeEnum.COLOR, value: '#f00' }],
  ];
  const result = validateDocumentModelCandidate(candidate, { original });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((item) => item.code === 'invalid-range'));
});

run('5. range válido mutilado pelo V2 → abort', () => {
  const original = modelWith([
    paragraph('el-a', 'Empresa ??NOME_DA_EMPRESA??', {
      inlineStyleRangeBlock: [
        [{ offset: 8, length: 18, style: InlineStyleTypeEnum.BOLD }],
      ],
    }),
  ]);
  const candidate = persistJson(original);
  candidate.sections[0].children!['section-body'][0].text = 'Empresa';
  candidate.sections[0].children!['section-body'][0].inlineStyleRangeBlock = [
    [{ offset: 8, length: 18, style: InlineStyleTypeEnum.BOLD }],
  ];
  const result = validateDocumentModelCandidate(candidate, { original });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((item) => item.code === 'invalid-range'));
});

run('6. edição em B não é bloqueada por range legado em A/C', () => {
  const original = modelWith([
    paragraph('el-a', shortLine, {
      inlineStyleRangeBlock: [[legacyOobRange]],
    }),
    paragraph('el-b', 'Dentro de B'),
    paragraph('el-c', shortLine, {
      entityRangeBlock: [
        [
          {
            offset: 449,
            length: 45,
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
  const candidate = persistJson(original);
  candidate.sections[0].children!['section-body'][1].text = 'Dentro de B editado';
  const result = validateDocumentModelCandidate(candidate, { original });
  assert.equal(result.ok, true);
  const diff = canonicalDiff(original, candidate);
  assert.ok(diff.some((item) => item.path.includes('el-b')));
  assert.equal(
    diff.some((item) => item.path.includes('el-a')),
    false,
  );
  assert.equal(
    diff.some((item) => item.path.includes('el-c')),
    false,
  );
});

run('6b. merge em outra section não toca range legado OOB', () => {
  const original = modelWith(
    [paragraph('el-b', 'Dentro de B')],
    [
      paragraph('el-a', shortLine, {
        inlineStyleRangeBlock: [[legacyOobRange]],
      }),
    ],
  );
  const edited = persistJson(
    projectEditorSlice(original, createSectionSelection('section-body')),
  );
  edited.sections[0].children!['section-body'][0].text = 'Dentro de B editado';
  const built = buildDocumentEditorCandidate({
    originalModel: original,
    selectedItem: createSectionSelection('section-body'),
    tipTapDoc: tipTapFromModel(edited),
  });
  assert.equal(built.validation.ok, true);
  assert.equal(
    built.diff.some((item) => item.path.includes('el-a')),
    false,
  );
  assert.deepStrictEqual(
    built.candidate.sections[0].children!['section-other'][0].inlineStyleRangeBlock,
    [[legacyOobRange]],
  );
});

run('7. no-op com range legado em outra section continua diff zero', () => {
  const original = modelWith(
    [paragraph('el-b', 'Estável')],
    [
      paragraph('el-a', shortLine, {
        inlineStyleRangeBlock: [[legacyOobRange]],
      }),
    ],
  );
  const built = buildDocumentEditorCandidate({
    originalModel: original,
    selectedItem: createSectionSelection('section-body'),
    tipTapDoc: tipTapFromModel(projectEditorSlice(original, createSectionSelection('section-body'))),
  });
  assert.deepStrictEqual(built.diff, []);
  assert.equal(built.validation.ok, true);
  assert.deepStrictEqual(
    built.candidate.sections[0].children!['section-other'][0].inlineStyleRangeBlock,
    [[legacyOobRange]],
  );
});

console.log('\nValidator variáveis / compatibilidade 5B: ok');
