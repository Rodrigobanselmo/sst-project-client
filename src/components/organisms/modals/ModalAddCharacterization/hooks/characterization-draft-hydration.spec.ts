import assert from 'node:assert/strict';
import {
  canHydrateCharacterizationField,
  mergeCharacterizationDraft,
} from './characterization-draft-hydration.ts';
import {
  getCharacterizationEditorSnapshot,
  isCharacterizationEditorDirty,
} from './characterization-editor-dirty.ts';

const remote = {
  name: 'Atividade cadastrada',
  description: 'Descrição cadastrada',
  riskInventorySummary: 'Resumo cadastrado',
  type: 'ACTIVITIES',
  profileName: 'Perfil cadastrado',
  noiseValue: '80',
  temperature: '25',
  luminosity: '100',
  moisturePercentage: '50',
  activities: ['Atividade anterior'],
  paragraphs: ['Parágrafo anterior'],
  considerations: ['Consideração anterior'],
  order: 3,
  status: 'ACTIVE',
};
const baseline = getCharacterizationEditorSnapshot({ current: remote });
const baselineBefore = JSON.stringify(baseline);
const dirty = {
  ...remote,
  name: 'Rascunho local',
  description: '',
  riskInventorySummary: '',
  profileName: 'Outro perfil',
  noiseValue: '0',
  temperature: 0,
  luminosity: '',
  moisturePercentage: '0',
  activities: ['Atividade local'],
  paragraphs: [],
  considerations: [],
  order: 0,
  status: 'INACTIVE',
};
const refreshed = {
  ...remote,
  name: 'Nome remoto atualizado',
  description: 'Descrição remota atualizada',
  hierarchies: [{ id: 'cargo-b' }],
};
const merged = mergeCharacterizationDraft({
  current: dirty,
  baseline,
  incoming: refreshed,
});
for (const field of Object.keys(dirty) as (keyof typeof dirty)[]) {
  assert.deepEqual(
    merged[field],
    dirty[field],
    `rascunho ${field} permanece após refresh dos vínculos`,
  );
}
assert.deepEqual(
  (merged as typeof merged & { hierarchies: unknown }).hierarchies,
  [{ id: 'cargo-b' }],
  'os vínculos remotos continuam atualizáveis',
);
assert.equal(
  JSON.stringify(baseline),
  baselineBefore,
  'o baseline remoto não vira rascunho',
);
assert.equal(
  isCharacterizationEditorDirty({ current: merged, baseline, form: dirty }),
  true,
);
assert.deepEqual(
  mergeCharacterizationDraft({
    current: remote,
    baseline,
    incoming: refreshed,
  }),
  refreshed,
  'campo intocado pode incorporar atualização remota',
);

// Controller conserva o valor RHF ao desmontar uma aba. O default de InputForm
// não deve reaplicá-lo por cima do valor local quando a aba é remontada.
for (const field of [
  'name',
  'description',
  'profileName',
  'riskInventorySummary',
  'noiseValue',
  'temperature',
  'luminosity',
  'moisturePercentage',
] as const) {
  assert.equal(
    canHydrateCharacterizationField(dirty[field], remote[field]),
    false,
    `default não apaga ${field}`,
  );
}
assert.equal(canHydrateCharacterizationField('ACTIVITIES', remote.type), true);
assert.equal(
  canHydrateCharacterizationField(undefined, 'Campo remoto'),
  true,
  'primeiro detalhe preenche campo ainda não montado',
);
assert.equal(
  canHydrateCharacterizationField('', undefined),
  true,
  'vazio inicial recebe informação remota',
);
assert.equal(
  canHydrateCharacterizationField('', 'Valor anterior'),
  false,
  'limpeza explícita não perde intenção',
);
assert.equal(
  canHydrateCharacterizationField(0, 10),
  false,
  'zero não é ausência',
);
assert.equal(
  canHydrateCharacterizationField(false, true),
  false,
  'false não é ausência',
);
assert.equal(
  canHydrateCharacterizationField(null, 'Valor anterior'),
  false,
  'null explícito não vira remoto',
);

const initiallyEmpty = {
  name: '',
  activities: [],
  paragraphs: [],
  considerations: [],
  order: 0,
  status: 'ACTIVE',
};
const initialBaseline = getCharacterizationEditorSnapshot({
  current: initiallyEmpty,
});
assert.deepEqual(
  mergeCharacterizationDraft({
    current: initiallyEmpty,
    baseline: initialBaseline,
    incoming: remote,
  }),
  remote,
  'a proteção não impede carregar detalhes iniciais',
);
console.log(
  'Characterization draft hydration: rascunhos, vazios, zeros, remontagem e baseline remoto verificados.',
);
