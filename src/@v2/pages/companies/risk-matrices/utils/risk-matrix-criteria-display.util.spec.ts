/**
 * Executar:
 * npx tsx src/@v2/pages/companies/risk-matrices/utils/risk-matrix-criteria-display.util.spec.ts
 */
import assert from 'node:assert/strict';

import { RiskMatrixCoverageKeyEnum } from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import {
  RISK_MATRIX_COVERAGE_LABELS,
  RISK_MATRIX_COVERAGE_OPTIONS,
} from '../maps/risk-matrix.maps';
import {
  groupCoverageCriteriaForDisplay,
  groupCriterionSiblings,
  parseCriterionHierarchy,
} from './risk-matrix-criteria-display.util';
import { SUBTYPE_CHIP_BY_NAME } from 'core/utils/risk-chip.util';

const p4Fis = [
  'Qualitativo',
  'Contato com o agente durante as condições normais de trabalho é frequente e a níveis altos.',
  '',
  'Quantitativo',
  'Ruído',
  '≥ 82 < 85 dB(A)',
  'Calor:',
  'Está na Região de incerteza',
  'Vibração (VCI)',
  '  aren: ≥ 0,9 <1,1 m/sˆ2',
  '  VDVR: ≥ 16,4 < 21 m/sˆ1,75)',
  'Vibração (VMB)',
  '  aren: ≥ 3,5 < 5,0 m/sˆ2',
  '',
  'Medidas de Controle',
  'com muitos desvios ou problemas e sem garantias de que sejam mantidas.',
].join('\n');

const p4Qui = [
  'Qualitativo',
  'Contato com o agente durante as condições normais de trabalho é frequente e a níveis altos.',
  '',
  'Quantitativo',
  'Químicos',
  'Entre 50 a 100% do LEO',
  '',
  'Medidas de Controle',
  'com muitos desvios ou problemas e sem garantias de que sejam mantidas.',
].join('\n');

const psicoP4 = [
  'O fator de risco é frequentemente reportado e em níveis que podem prejudicar o bem-estar',
  '',
  'Percepção coletiva indica persistência do fator de risco e efeitos nocivos relevantes',
  '',
  'Exemplos no COPSOQ III:',
  'Intensidade 4 (Muito)',
  'Frequência 4 (Frequentemente)',
  '',
  'Medidas de Controle',
  'com muitos desvios ou problemas e sem garantias de que sejam mantidas.',
].join('\n');

const nodes = parseCriterionHierarchy(p4Fis);
const headings = nodes.filter((node) => node.kind === 'heading').map((node) => node.text);
assert.deepEqual(headings, [
  'Qualitativo',
  'Quantitativo',
  'Ruído',
  'Calor:',
  'Vibração (VCI)',
  'Vibração (VMB)',
  'Medidas de Controle',
]);
assert.equal(
  nodes.find((node) => node.kind === 'body' && node.text.startsWith('aren: ≥ 0,9'))?.depth,
  2,
);

const items = groupCoverageCriteriaForDisplay({
  selectedCoverages: [
    RiskMatrixCoverageKeyEnum.FIS,
    RiskMatrixCoverageKeyEnum.QUI,
    RiskMatrixCoverageKeyEnum.BIO,
    RiskMatrixCoverageKeyEnum.ACI,
    RiskMatrixCoverageKeyEnum.ERG,
    RiskMatrixCoverageKeyEnum.PSICOSOCIAL,
  ],
  criteriaByCoverage: {
    [RiskMatrixCoverageKeyEnum.FIS]: p4Fis,
    [RiskMatrixCoverageKeyEnum.QUI]: p4Qui,
    [RiskMatrixCoverageKeyEnum.BIO]: 'BIO P4',
    [RiskMatrixCoverageKeyEnum.ACI]: 'ACI P4',
    [RiskMatrixCoverageKeyEnum.ERG]: 'ERG P4',
    [RiskMatrixCoverageKeyEnum.PSICOSOCIAL]: psicoP4,
  },
  undefinedCoverages: [],
  options: RISK_MATRIX_COVERAGE_OPTIONS,
});

assert.deepEqual(
  items.map((item) => item.key),
  [
    RiskMatrixCoverageKeyEnum.FIS,
    RiskMatrixCoverageKeyEnum.QUI,
    RiskMatrixCoverageKeyEnum.BIO,
    RiskMatrixCoverageKeyEnum.ACI,
    RiskMatrixCoverageKeyEnum.ERG,
    RiskMatrixCoverageKeyEnum.PSICOSOCIAL,
  ],
);
assert.equal(items[0].label, 'FIS — Físico');
assert.equal(items[1].label, 'QUI — Químico');
assert.equal(items[5].label, 'PSIC — Psicossocial');
assert.equal(items[0].coverageKeys.length, 1);
assert.equal(items[1].coverageKeys.length, 1);
assert.equal(items[0].criterion, p4Fis);
assert.equal(items[1].criterion, p4Qui);
assert.equal(items[0].criterion.includes('Químicos'), false);
assert.equal(items[1].criterion.includes('Ruído'), false);
assert.equal(
  items.find((item) => item.key === RiskMatrixCoverageKeyEnum.PSICOSOCIAL)?.isUndefined,
  false,
);
assert.equal(
  items.find((item) => item.key === RiskMatrixCoverageKeyEnum.PSICOSOCIAL)?.criterion,
  psicoP4,
);

assert.equal(
  RISK_MATRIX_COVERAGE_LABELS[RiskMatrixCoverageKeyEnum.PSICOSOCIAL],
  SUBTYPE_CHIP_BY_NAME.Psicossociais.suffix,
);
assert.equal(
  RISK_MATRIX_COVERAGE_OPTIONS.find(
    (option) => option.value === RiskMatrixCoverageKeyEnum.PSICOSOCIAL,
  )?.code,
  'PSIC',
);
assert.equal(RiskMatrixCoverageKeyEnum.PSICOSOCIAL, 'PSICOSOCIAL');

const bioP4 = [
  'Procedimento envolvendo perigo de disseminação de agente biológico por gotículas, envolvendo perfurocortantes ou não, em atividades de assistência à saúde humana, veterinária, agronegócio ou atividades laboratoriais, incluindo atividades de apoio a estes segmentos ou outras atividades que tenham contato com cadáveres, carcaças, materiais contaminados, efluentes e resíduos infectantes.',
  '',
  'Medidas de Controle',
  'com muitos desvios ou problemas e sem garantias de que sejam mantidas.',
].join('\n');
const aciP4 = [
  'Pode prejudicar a integridade física, provocando amputações ou esmagamentos, perda de visão, fraturas que necessitem de intervenção cirúrgica ou que tenham elevado risco de causar incapacidade permanente, queimaduras que atinjam toda a face ou mais de 30% da superfície corporal ou outros agravos que resultem em incapacidade para as atividades habituais por meses.',
  '',
  'Medidas de Controle',
  'com muitos desvios ou problemas e sem garantias de que sejam mantidas.',
].join('\n');
const ergP4 = [
  'Pode prejudicar a integridade física e/ou a saúde, provocando lesão ou sequelas permanentes com encaminhamento a reabilitação profissional do INSS.',
  '',
  'Altos danos aos equipamentos, processo, meio ambiente ou insatisfação no trabalhador e sobrecarga física ou cognitiva.',
  '',
  'Risco alto conforme as ferramentas ergonômicas.',
  '',
  'Medidas de Controle',
  'com muitos desvios ou problemas e sem garantias de que sejam mantidas.',
].join('\n');

const bioSiblings = groupCriterionSiblings(parseCriterionHierarchy(bioP4));
assert.equal(bioSiblings.length, 2);
assert.equal(bioSiblings[0].title, null);
assert.equal(
  bioSiblings[0].body[0].includes('Procedimento envolvendo perigo de disseminação'),
  true,
);
assert.equal(bioSiblings[1].title, 'Medidas de Controle');
assert.equal(bioSiblings[1].body.includes('Procedimento envolvendo perigo de disseminação'), false);

const aciSiblings = groupCriterionSiblings(parseCriterionHierarchy(aciP4));
assert.equal(aciSiblings.length, 2);
assert.equal(aciSiblings[0].title, null);
assert.equal(aciSiblings[0].body[0].includes('amputações'), true);
assert.equal(aciSiblings[1].title, 'Medidas de Controle');

const ergSiblings = groupCriterionSiblings(parseCriterionHierarchy(ergP4));
assert.equal(ergSiblings.length, 4);
assert.equal(ergSiblings[0].title, null);
assert.equal(ergSiblings[0].body[0].includes('INSS'), true);
assert.equal(ergSiblings[1].body[0].includes('Altos danos aos equipamentos'), true);
assert.equal(ergSiblings[2].body[0], 'Risco alto conforme as ferramentas ergonômicas.');
assert.equal(ergSiblings[3].title, 'Medidas de Controle');

const fisSiblings = groupCriterionSiblings(nodes);
assert.deepEqual(
  fisSiblings.map((group) => group.title),
  ['Qualitativo', 'Quantitativo', 'Medidas de Controle'],
);
assert.equal(
  fisSiblings[0].body.some((line) => line.includes('Ruído')),
  false,
);
assert.equal(
  fisSiblings[1].body.some((line) => line.includes('Vibração (VCI)')),
  true,
);

const psicoSiblings = groupCriterionSiblings(parseCriterionHierarchy(psicoP4));
assert.equal(psicoSiblings.length, 4);
assert.equal(psicoSiblings[0].title, null);
assert.equal(psicoSiblings[0].body[0].includes('frequentemente reportado'), true);
assert.equal(psicoSiblings[1].title, null);
assert.equal(psicoSiblings[2].title, 'Exemplos no COPSOQ III:');
assert.equal(
  psicoSiblings[2].body.some((line) => line.includes('Intensidade')),
  true,
);
assert.equal(
  psicoSiblings[2].body.some((line) => line.includes('Frequência')),
  true,
);
assert.equal(psicoSiblings[3].title, 'Medidas de Controle');
assert.equal(
  parseCriterionHierarchy(psicoP4).find(
    (node) => node.kind === 'heading' && node.text.startsWith('Intensidade'),
  )?.depth,
  1,
);

console.log('risk-matrix-criteria-display.util.spec.ts OK');
