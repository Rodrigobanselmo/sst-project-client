import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hierarchyLevelOrder } from './sector-picker.model.ts';
import { formatHierarchyGroupOptionLabel } from './formatHierarchyGroupOptionLabel.ts';
test('orders registered ancestors across companies with different depths without hard-coded levels', () => {
  const root = { id: 'm', name: 'Gerência A', type: 'MANAGEMENT' };
  const options = [
    { id: 'a', name: 'Setor', hierarchyPath: [root] },
    {
      id: 'b',
      name: 'Setor',
      hierarchyPath: [
        { id: 'd', name: 'Diretoria', type: 'DIRECTORY' },
        root,
        { id: 'x', name: 'Unidade especial', type: 'CUSTOM' },
      ],
    },
  ];
  assert.deepEqual(hierarchyLevelOrder(options), [
    'DIRECTORY',
    'MANAGEMENT',
    'CUSTOM',
  ]);
  assert.deepEqual(
    hierarchyLevelOrder([{ id: 'z', name: 'Sem ancestrais' }]),
    [],
  );
});
test('labels include company, establishment and complete registered ancestors', () => {
  const label = formatHierarchyGroupOptionLabel({
    id: 'a',
    name: 'Recepção',
    companyName: 'Empresa A',
    establishment: 'Hotel A',
    hierarchyPath: [
      { id: 'd', name: 'Diretoria de Operações', type: 'DIRECTORY' },
      { id: 'g', name: 'Gerência de Hospitalidade', type: 'MANAGEMENT' },
    ],
    participantCount: 3,
  });
  assert.equal(
    label,
    'Setor: Recepção — Empresa: Empresa A — Estabelecimento: Hotel A — Diretoria: Diretoria de Operações — Gerência: Gerência de Hospitalidade — 3 participantes',
  );
});

test('visibility controls omit only presentation levels and preserve registered ancestors and identity', async () => {
  const { sectorContextParts, sectorPresentationLabel } = await import(
    './sector-picker.model.ts'
  );
  const option = {
    id: 'sector-1',
    name: 'Recepção',
    companyId: 'legal-1',
    companyName: 'Razão social',
    establishment: 'Hotel',
    hierarchyPath: [
      { id: 'd', name: 'Operações', type: 'DIRECTORY' },
      { id: 'm', name: 'Hospedagem', type: 'MANAGEMENT' },
    ],
  };
  assert.deepEqual(
    sectorContextParts(option, {
      hideCompany: false,
      hideEstablishment: false,
    }),
    [
      'Empresa: Razão social',
      'Estabelecimento: Hotel',
      'Diretoria: Operações',
      'Gerência: Hospedagem',
    ],
  );
  assert.deepEqual(
    sectorContextParts(option, { hideCompany: true, hideEstablishment: false }),
    ['Estabelecimento: Hotel', 'Diretoria: Operações', 'Gerência: Hospedagem'],
  );
  assert.deepEqual(
    sectorContextParts(option, { hideCompany: false, hideEstablishment: true }),
    ['Empresa: Razão social', 'Diretoria: Operações', 'Gerência: Hospedagem'],
  );
  assert.equal(
    sectorPresentationLabel(option, {
      hideCompany: true,
      hideEstablishment: true,
    }),
    'Setor: Recepção — Diretoria: Operações — Gerência: Hospedagem',
  );
  assert.equal(option.companyId, 'legal-1');
  assert.equal(option.establishment, 'Hotel');
  assert.equal(option.hierarchyPath.length, 2);
  assert.equal(
    sectorPresentationLabel(
      {
        id: 's',
        name: 'Setor isolado',
        companyName: 'Empresa',
        establishment: 'Local',
      },
      { hideCompany: true, hideEstablishment: true },
    ),
    'Setor: Setor isolado',
  );
});

test('company display name uses registered fantasy name with legal-name fallback', async () => {
  const { sectorContextParts } = await import('./sector-picker.model.ts');
  const option = {
    id: 's',
    name: 'Setor',
    companyId: 'c',
    companyName: 'Razão social',
    companyFantasy: 'Nome fantasia',
  };
  assert.deepEqual(
    sectorContextParts(option, {
      hideCompany: false,
      hideEstablishment: false,
      companyNameMode: 'fantasy',
    }),
    ['Empresa: Nome fantasia'],
  );
  assert.deepEqual(
    sectorContextParts(option, {
      hideCompany: false,
      hideEstablishment: false,
      companyNameMode: 'legal',
    }),
    ['Empresa: Razão social'],
  );
  assert.deepEqual(
    sectorContextParts(
      { ...option, companyFantasy: '  ' },
      {
        hideCompany: false,
        hideEstablishment: false,
        companyNameMode: 'fantasy',
      },
    ),
    ['Empresa: Razão social'],
  );
  assert.equal(option.companyId, 'c');
});
