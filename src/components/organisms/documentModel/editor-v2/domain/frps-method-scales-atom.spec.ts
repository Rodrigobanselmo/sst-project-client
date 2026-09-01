/**
 * Tipos canônicos FRPS_METHOD_SCALES_* e aliases de leitura FRPS_COPSOQ_SCALES_*.
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/editor-v2/domain/frps-method-scales-atom.spec.ts
 */
import assert from 'assert';

import { getSchema } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import { EditorState } from '@tiptap/pm/state';
import {
  IDocumentModelData,
  IDocumentModelElement,
} from 'core/interfaces/api/IDocumentModel';
import {
  DocumentSectionChildrenTypeEnum,
  DocumentSectionTypeEnum,
} from 'project/enum/document-model.enum';

import { fromDocumentEditorState, toDocumentEditorState } from '../adapter';
import { atomVisualLabel, classifyAtomType } from './atom-visual';
import { createDocumentEditorExtensions } from '../tiptap/extensions/create-document-editor-extensions';
import { fromTipTapState } from '../tiptap/from-tiptap-state';
import { serializeTipTapDoc } from '../tiptap/schema';
import { toTipTapState } from '../tiptap/to-tiptap-state';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

function modelWithChildren(children: IDocumentModelElement[]): IDocumentModelData {
  return {
    variables: [],
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

function restore(state: EditorState) {
  return fromDocumentEditorState(fromTipTapState(state.doc.toJSON()));
}

function childrenOf(model: IDocumentModelData): IDocumentModelElement[] {
  return model.sections[0].children!['section-body'];
}

run('enum canônico e alias legado existem com valores persistidos distintos', () => {
  assert.equal(
    DocumentSectionChildrenTypeEnum.FRPS_METHOD_SCALES_TABLE,
    'FRPS_METHOD_SCALES_TABLE',
  );
  assert.equal(
    DocumentSectionChildrenTypeEnum.FRPS_METHOD_SCALES_CHART,
    'FRPS_METHOD_SCALES_CHART',
  );
  assert.equal(
    DocumentSectionChildrenTypeEnum.FRPS_COPSOQ_SCALES_TABLE,
    'FRPS_COPSOQ_SCALES_TABLE',
  );
  assert.equal(
    DocumentSectionChildrenTypeEnum.FRPS_COPSOQ_SCALES_CHART,
    'FRPS_COPSOQ_SCALES_CHART',
  );
});

run('labels visuais são neutros para canônico e legado', () => {
  assert.equal(
    atomVisualLabel(DocumentSectionChildrenTypeEnum.FRPS_METHOD_SCALES_TABLE),
    'Tabela FRPS – Escalas do Método Aplicado',
  );
  assert.equal(
    atomVisualLabel(DocumentSectionChildrenTypeEnum.FRPS_COPSOQ_SCALES_TABLE),
    'Tabela FRPS – Escalas do Método Aplicado',
  );
  assert.equal(
    atomVisualLabel(DocumentSectionChildrenTypeEnum.FRPS_METHOD_SCALES_CHART),
    'Gráfico FRPS – Escalas do Método Aplicado',
  );
  assert.equal(
    atomVisualLabel(DocumentSectionChildrenTypeEnum.FRPS_COPSOQ_SCALES_CHART),
    'Gráfico FRPS – Escalas do Método Aplicado',
  );
  assert.equal(
    classifyAtomType(DocumentSectionChildrenTypeEnum.FRPS_COPSOQ_SCALES_TABLE),
    'table',
  );
  assert.equal(
    classifyAtomType(DocumentSectionChildrenTypeEnum.FRPS_METHOD_SCALES_CHART),
    'table',
  );
});

run('modelo antigo com FRPS_COPSOQ_SCALES_TABLE continua abrindo', () => {
  const restored = childrenOf(
    restore(
      stateFromModel(
        modelWithChildren([
          {
            id: 'el-legacy-table',
            type: DocumentSectionChildrenTypeEnum.FRPS_COPSOQ_SCALES_TABLE,
            text: '',
          },
        ]),
      ),
    ),
  );
  assert.equal(restored[0].type, 'FRPS_COPSOQ_SCALES_TABLE');
});

run('modelo antigo com FRPS_COPSOQ_SCALES_CHART continua abrindo', () => {
  const restored = childrenOf(
    restore(
      stateFromModel(
        modelWithChildren([
          {
            id: 'el-legacy-chart',
            type: DocumentSectionChildrenTypeEnum.FRPS_COPSOQ_SCALES_CHART,
            text: '',
          },
        ]),
      ),
    ),
  );
  assert.equal(restored[0].type, 'FRPS_COPSOQ_SCALES_CHART');
});

run('novo bloco de tabela persiste FRPS_METHOD_SCALES_TABLE', () => {
  const restored = childrenOf(
    restore(
      stateFromModel(
        modelWithChildren([
          {
            id: 'el-method-table',
            type: DocumentSectionChildrenTypeEnum.FRPS_METHOD_SCALES_TABLE,
            text: '',
          },
        ]),
      ),
    ),
  );
  assert.equal(restored[0].type, 'FRPS_METHOD_SCALES_TABLE');
});

run('novo bloco de gráfico persiste FRPS_METHOD_SCALES_CHART', () => {
  const restored = childrenOf(
    restore(
      stateFromModel(
        modelWithChildren([
          {
            id: 'el-method-chart',
            type: DocumentSectionChildrenTypeEnum.FRPS_METHOD_SCALES_CHART,
            text: '',
          },
        ]),
      ),
    ),
  );
  assert.equal(restored[0].type, 'FRPS_METHOD_SCALES_CHART');
});

console.log('\nFRPS method scales atoms: ok');
