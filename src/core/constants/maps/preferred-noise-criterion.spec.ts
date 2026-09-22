/**
 * Executar:
 * npx tsx src/core/constants/maps/preferred-noise-criterion.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  DEFAULT_PREFERRED_NOISE_CRITERION,
  PreferredNoiseCriterionEnum,
  normalizePreferredNoiseCriterion,
} from './preferred-noise-criterion';

assert.equal(
  DEFAULT_PREFERRED_NOISE_CRITERION,
  PreferredNoiseCriterionEnum.NHO01_Q3,
);
assert.equal(normalizePreferredNoiseCriterion(null), PreferredNoiseCriterionEnum.NHO01_Q3);
assert.equal(normalizePreferredNoiseCriterion(undefined), PreferredNoiseCriterionEnum.NHO01_Q3);
assert.equal(normalizePreferredNoiseCriterion(''), PreferredNoiseCriterionEnum.NHO01_Q3);
assert.equal(
  normalizePreferredNoiseCriterion('NR15_Q5'),
  PreferredNoiseCriterionEnum.NR15_Q5,
);
assert.equal(
  normalizePreferredNoiseCriterion('NHO01_Q3'),
  PreferredNoiseCriterionEnum.NHO01_Q3,
);
assert.equal(
  normalizePreferredNoiseCriterion('INVALID'),
  PreferredNoiseCriterionEnum.NHO01_Q3,
);

const editWorkspace = readFileSync(
  resolve(
    'src/components/organisms/modals/ModalAddWorkspace/hooks/useEditWorkspace.ts',
  ),
  'utf8',
);
assert.match(editWorkspace, /preferredNoiseCriterion/);
assert.match(editWorkspace, /normalizePreferredNoiseCriterion/);
assert.match(
  editWorkspace,
  /preferredNoiseCriterion: normalizePreferredNoiseCriterion\(\s*companyData\.preferredNoiseCriterion/,
);

const workspaceStep = readFileSync(
  resolve(
    'src/components/organisms/modals/ModalAddWorkspace/components/ModalWorkspaceStep/index.tsx',
  ),
  'utf8',
);
assert.match(workspaceStep, /Critério quantitativo de ruído \(PGR\)/);
assert.match(workspaceStep, /preferredNoiseCriterionOptions/);
assert.match(workspaceStep, /preferredNoiseCriterionHelp/);

const helpMap = readFileSync(
  resolve('src/core/constants/maps/preferred-noise-criterion.ts'),
  'utf8',
);
assert.match(
  helpMap,
  /Critério padrão SimpleSST para avaliação quantitativa de ruído no PGR/,
);
assert.match(
  helpMap,
  /Utiliza o critério NR-15 Q5 para o risco ocupacional de ruído deste estabelecimento/,
);

console.log('preferred-noise-criterion.spec.ts ok');
