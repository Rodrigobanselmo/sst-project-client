/**
 * Coleta metodológica por agente no editor de método HO.
 * Executar: npx tsx src/@v2/pages/companies/ho-methods/utils/ho-method-agent-sampling.util.spec.ts
 */
import { HoMethodEvaluationTypeEnum } from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';

import {
  applyAgentCollection,
  deriveAgentCollection,
  formatAgentCollectionLine,
  shouldShowMethodLevelFlowFields,
} from './ho-method-agent-sampling.util';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const benzene = [
  {
    evaluationType: HoMethodEvaluationTypeEnum.CMPT,
    limitValue: '1',
    limitUnit: 'ppm',
    minimumFlowRate: null,
    maximumFlowRate: 0.2,
    minimumVolume: 5,
    maximumVolume: 30,
    flowRateUnit: 'L/min',
    volumeUnit: 'L',
  },
  {
    evaluationType: HoMethodEvaluationTypeEnum.TWA,
    limitValue: '0,5',
    limitUnit: 'ppm',
    minimumFlowRate: null,
    maximumFlowRate: 0.2,
    minimumVolume: 5,
    maximumVolume: 30,
    flowRateUnit: 'L/min',
    volumeUnit: 'L',
  },
  {
    evaluationType: HoMethodEvaluationTypeEnum.STEL,
    limitValue: '2,5',
    limitUnit: 'ppm',
    minimumFlowRate: null,
    maximumFlowRate: 0.2,
    minimumVolume: 5,
    maximumVolume: 30,
    flowRateUnit: 'L/min',
    volumeUnit: 'L',
  },
  {
    evaluationType: HoMethodEvaluationTypeEnum.VMP,
    limitValue: '3',
    limitUnit: 'ppm',
    minimumFlowRate: null,
    maximumFlowRate: 0.2,
    minimumVolume: 5,
    maximumVolume: 30,
    flowRateUnit: 'L/min',
    volumeUnit: 'L',
  },
];

const derived = deriveAgentCollection(benzene);
assert(derived.kind === 'uniform', 'benzene deve ter uma coleta só');
if (derived.kind === 'uniform') {
  assert(derived.sampling.maximumFlowRate === 0.2, 'vazão máxima do benzeno');
  assert(derived.sampling.minimumVolume === 5, 'volume mínimo do benzeno');
  assert(derived.sampling.maximumVolume === 30, 'volume máximo do benzeno');
  assert(
    formatAgentCollectionLine(derived.sampling) ===
      'vazão máx. 0,2 L/min; volume 5–30 L',
    'texto da coleta do benzeno',
  );
}

const edited = applyAgentCollection(benzene, {
  maximumFlowRate: 0.25,
  minimumVolume: 4,
});
assert(edited.length === 4, 'edição preserva as quatro condições ocupacionais');
assert(
  edited.every(
    (condition) =>
      condition.maximumFlowRate === 0.25 &&
      condition.minimumVolume === 4 &&
      condition.maximumVolume === 30,
  ),
  'edição replica a coleta em todas as condições do agente',
);
assert(
  edited.map((condition) => condition.evaluationType).join(',') ===
    [HoMethodEvaluationTypeEnum.CMPT, HoMethodEvaluationTypeEnum.TWA, HoMethodEvaluationTypeEnum.STEL, HoMethodEvaluationTypeEnum.VMP].join(','),
  'edição não troca TWA/STEL/CMPT/VMP',
);
assert(edited[1].limitValue === '0,5', 'edição preserva o limite ocupacional');

const mixed = deriveAgentCollection([
  benzene[0],
  { ...benzene[1], maximumVolume: 12 },
]);
assert(mixed.kind === 'mixed', 'coletas diferentes não são colapsadas');

assert(
  deriveAgentCollection([
    {
      evaluationType: HoMethodEvaluationTypeEnum.TWA,
      limitValue: '10',
    },
  ]).kind === 'absent',
  'condição ocupacional sem vazão/volume não cria bloco vazio',
);

assert(
  shouldShowMethodLevelFlowFields({
    methodFlowValues: ['', '', '', ''],
    agents: [{ evaluationConditions: benzene }],
  }) === false,
  '1501 não mostra vazão geral vazia',
);
assert(
  shouldShowMethodLevelFlowFields({
    methodFlowValues: ['', '0,2', '', ''],
    agents: [{ evaluationConditions: benzene }],
  }) === true,
  'método antigo com vazão geral continua editável',
);

const reopened = deriveAgentCollection(edited);
assert(reopened.kind === 'uniform', 'reabertura continua com uma coleta');
if (reopened.kind === 'uniform') {
  assert(reopened.sampling.maximumFlowRate === 0.25, 'valor editado sobrevive na leitura');
  assert(reopened.sampling.minimumVolume === 4, 'volume editado sobrevive na leitura');
}

console.log('ho-method-agent-sampling.util.spec: ok');
