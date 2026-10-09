/**
 * Runnable with:
 *   npx tsx src/components/organisms/modals/ModalAddCharacterization/hooks/characterization-props-hydration.spec.ts
 */
import assert from 'assert';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { decideCharacterizationPropsHydration } from './characterization-props-hydration';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const age = {
  id: 'age',
  companyId: 'sefaz',
  workspaceId: 'sede',
  name: 'AGE — Auditoria Geral do Estado',
  type: 'ACTIVITIES',
  description: 'Auditoria',
};

function passes(params: {
  listFetched: boolean;
  initialData: typeof age | { id?: string; companyId?: string; workspaceId?: string };
  foundId?: string | null;
  times: number;
  hydrationMark?: string;
}) {
  let mark = params.hydrationMark || '';
  let applies = 0;
  let settles = 0;
  for (let index = 0; index < params.times; index += 1) {
    const decision = decideCharacterizationPropsHydration({
      hasInitialData: true,
      listFetched: params.listFetched,
      hydrationMark: mark,
      initialData: params.initialData,
      foundId: params.foundId,
    });
    if (decision.action === 'apply') applies += 1;
    if (decision.action === 'settle') settles += 1;
    if (decision.action === 'apply' || decision.action === 'settle') {
      mark = decision.nextMark;
    }
  }
  return { applies, settles, mark };
}

run('lista indisponível não repete a hidratação', () => {
  const first = passes({
    listFetched: false,
    initialData: age,
    times: 60,
  });
  assert.equal(first.applies, 1);
  assert.equal(first.settles, 0);
  assert.equal(first.mark, 'identity:age::sefaz::sede');
});

run('lista que chega depois incorpora o registro uma vez', () => {
  const waiting = passes({
    listFetched: false,
    initialData: age,
    times: 1,
  });
  const loaded = passes({
    listFetched: true,
    initialData: age,
    foundId: age.id,
    hydrationMark: waiting.mark,
    times: 60,
  });
  assert.equal(loaded.applies, 1);
  assert.equal(loaded.settles, 0);
  assert.equal(loaded.mark, 'complete:age::sefaz::sede');
});

run('registro ausente na lista conclui uma única vez', () => {
  const waiting = passes({
    listFetched: false,
    initialData: age,
    times: 1,
  });
  const settled = passes({
    listFetched: true,
    initialData: age,
    foundId: null,
    hydrationMark: waiting.mark,
    times: 60,
  });
  assert.equal(settled.applies, 0);
  assert.equal(settled.settles, 1);
  assert.equal(settled.mark, 'complete:age::sefaz::sede');
});

run('lista já disponível hidrata o registro encontrado uma vez', () => {
  const result = passes({
    listFetched: true,
    initialData: { id: age.id, companyId: age.companyId, workspaceId: age.workspaceId },
    foundId: age.id,
    times: 60,
  });
  assert.equal(result.applies, 1);
  assert.equal(result.settles, 0);
  assert.equal(result.mark, 'complete:age::sefaz::sede');
});

run('troca de caracterização hidrata o novo registro', () => {
  const ageDone = passes({
    listFetched: true,
    initialData: age,
    foundId: age.id,
    times: 1,
  });
  const other = {
    id: 'outro',
    companyId: 'sefaz',
    workspaceId: 'sede',
  };
  const switched = passes({
    listFetched: true,
    initialData: other,
    foundId: null,
    hydrationMark: ageDone.mark,
    times: 60,
  });
  assert.equal(switched.applies, 1);
  assert.equal(switched.mark, 'complete:outro::sefaz::sede');

  const back = passes({
    listFetched: true,
    initialData: age,
    foundId: age.id,
    hydrationMark: switched.mark,
    times: 5,
  });
  assert.equal(back.applies, 1);
  assert.equal(back.mark, 'complete:age::sefaz::sede');
});

run('perfil filho e passBack não gravam hidratação', () => {
  const child = decideCharacterizationPropsHydration({
    hasInitialData: true,
    profileParentId: 'pai',
    listFetched: true,
    hydrationMark: '',
    initialData: age,
    foundId: age.id,
  });
  assert.equal(child.action, 'ignore');

  const passBack = decideCharacterizationPropsHydration({
    hasInitialData: true,
    listFetched: false,
    hydrationMark: '',
    initialData: { ...age, passBack: true },
  });
  assert.equal(passBack.action, 'ignore');
});

const querySource = readFileSync(
  resolve('src/core/services/hooks/queries/useQueryCharacterizations/index.ts'),
  'utf8',
);
run('a lista vazia da query é uma referência estável', () => {
  assert.equal(querySource.includes('EMPTY_CHARACTERIZATION_LIST'), true);
  assert.equal(querySource.includes('data ?? EMPTY_CHARACTERIZATION_LIST'), true);
  assert.equal(querySource.includes('data || []'), false);
});

const hookSource = readFileSync(
  resolve(
    'src/components/organisms/modals/ModalAddCharacterization/hooks/useEditCharacterization.tsx',
  ),
  'utf8',
);
run('o efeito usa a decisão e mantém setValue nas dependências', () => {
  const start = hookSource.indexOf(
    'const decision = decideCharacterizationPropsHydration',
  );
  assert.equal(start > 0, true);
  const effect = hookSource.slice(start, start + 2200);
  assert.equal(effect.includes('characterizationsFetched'), true);
  assert.equal(effect.includes('setValue,'), true);
  assert.equal(effect.includes('setCharacterizationData'), true);
});

console.log('\nAll characterization props hydration tests passed.');
