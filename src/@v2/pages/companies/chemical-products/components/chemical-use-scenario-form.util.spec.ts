/**
 * Executar: npx tsx src/@v2/pages/companies/chemical-products/components/chemical-use-scenario-form.util.spec.ts
 */
import type { ChemicalProductListItem } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import {
  buildCreateChemicalUseScenarioPayload,
  CHEMICAL_USE_SCENARIO_FREQUENCY_PERIODS,
  CHEMICAL_USE_SCENARIO_QUANTITY_UNITS,
  chemicalUseScenarioManualCreateHasForbiddenKeys,
  emptyChemicalUseScenarioFormValues,
  formatChemicalUseScenarioProductOption,
  isChemicalUseScenarioSubmitBlocked,
  submitCreateChemicalUseScenarioForm,
  type ChemicalUseScenarioFormValues,
} from './chemical-use-scenario-form.util';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function product(
  overrides: Partial<ChemicalProductListItem> = {},
): ChemicalProductListItem {
  return {
    id: 'product-uuid-651st',
    companyId: 'company-1',
    workspaceId: 'workspace-1',
    tradeName: '651ST',
    manufacturer: 'Fabricante A',
    isPureSubstance: false,
    status: 'ACTIVE',
    ingredientCount: 1,
    activeComposition: null,
    activeFispq: null,
    ...overrides,
  };
}

function values(
  overrides: Partial<ChemicalUseScenarioFormValues> = {},
): ChemicalUseScenarioFormValues {
  return {
    ...emptyChemicalUseScenarioFormValues(),
    product: product(),
    activityName: 'Dosagem',
    ...overrides,
  };
}

const created = buildCreateChemicalUseScenarioPayload(values());
assert(created.ok, 'payload de create válido');
if (!created.ok) throw new Error(created.error);

assert(
  created.body.chemicalProductId === 'product-uuid-651st',
  'produto selecionado envia UUID',
);
assert(created.body.activityName === 'Dosagem', 'tarefa no payload');
assert(
  created.body.surveyStatus === 'LEVANTAMENTO_CONCLUIDO',
  'surveyStatus manual concluído',
);
assert(
  chemicalUseScenarioManualCreateHasForbiddenKeys(created.body).length === 0,
  'source*/fingerprint/notes não enviados',
);
assert(!('sourceSheet' in created.body), 'sourceSheet ausente');
assert(!('sourceRows' in created.body), 'sourceRows ausente');
assert(!('sourceRaw' in created.body), 'sourceRaw ausente');
assert(!('sourceProductLabel' in created.body), 'sourceProductLabel ausente');
assert(!('linachHint' in created.body), 'linachHint ausente');
assert(!('relevanceHint' in created.body), 'relevanceHint ausente');
assert(!('notes' in created.body), 'notes ausente');
assert(!('fingerprint' in created.body), 'fingerprint ausente');

const missingProduct = buildCreateChemicalUseScenarioPayload(
  values({ product: null, activityName: 'Dosagem' }),
);
assert(!missingProduct.ok, 'produto obrigatório');

const archived = buildCreateChemicalUseScenarioPayload(
  values({ product: product({ status: 'ARCHIVED' }) }),
);
assert(!archived.ok, 'produto arquivado bloqueado');

const missingActivity = buildCreateChemicalUseScenarioPayload(
  values({ activityName: '   ' }),
);
assert(!missingActivity.ok, 'tarefa obrigatória sem espaços');

const quantityText = buildCreateChemicalUseScenarioPayload(
  values({ quantity: 'até 10', quantityUnit: 'L' }),
);
assert(quantityText.ok, 'quantity string aceita');
if (!quantityText.ok) throw new Error(quantityText.error);
assert(quantityText.body.quantity === 'até 10', 'quantity preserva string');
assert(quantityText.body.quantityUnit === 'L', 'unidade textual');
assert(typeof quantityText.body.quantity === 'string', 'quantity não vira number');

assert(
  CHEMICAL_USE_SCENARIO_FREQUENCY_PERIODS.join() ===
    'Diário,Semanal,Quinzenal,Mensal,Semestre',
  'taxonomia de período SURVEY/TECHNICAL',
);
assert(
  CHEMICAL_USE_SCENARIO_QUANTITY_UNITS.join() === 'mL,L,litros,Kg',
  'taxonomia de unidade SURVEY/TECHNICAL',
);

const badPeriod = buildCreateChemicalUseScenarioPayload(
  values({ frequencyPeriod: 'xxx' }),
);
assert(!badPeriod.ok, 'período arbitrário bloqueado');

const badUnit = buildCreateChemicalUseScenarioPayload(
  values({ quantityUnit: 'xxxx' }),
);
assert(!badUnit.ok, 'unidade arbitrária bloqueada');

const surveyUnit = buildCreateChemicalUseScenarioPayload(
  values({ frequencyPeriod: 'Quinzenal', quantityUnit: 'litros' }),
);
assert(surveyUnit.ok, 'Quinzenal + litros da taxonomia SURVEY');
if (!surveyUnit.ok) throw new Error(surveyUnit.error);
assert(surveyUnit.body.frequencyPeriod === 'Quinzenal', 'período controlado');
assert(surveyUnit.body.quantityUnit === 'litros', 'unidade controlada');

const emptyOptionals = buildCreateChemicalUseScenarioPayload(values());
assert(emptyOptionals.ok, 'opcionais vazios aceitos');
if (!emptyOptionals.ok) throw new Error(emptyOptionals.error);
assert(emptyOptionals.body.sectorSnapshot === null, 'setor vazio → null');
assert(emptyOptionals.body.exposureGroupSnapshot === null, 'GSE vazio → null');
assert(emptyOptionals.body.exposedRolesSnapshot === null, 'cargos vazio → null');
assert(emptyOptionals.body.frequencyCount === null, 'freq nº vazio → null');
assert(emptyOptionals.body.frequencyPeriod === null, 'freq período vazio → null');
assert(emptyOptionals.body.durationMinutes === null, 'duração vazia → null');
assert(emptyOptionals.body.quantity === null, 'quantidade vazia → null');
assert(emptyOptionals.body.quantityUnit === null, 'unidade vazia → null');
assert(emptyOptionals.body.peakContactMoment === null, 'contato vazio → null');
assert(emptyOptionals.body.controlMeasures === null, 'controles vazio → null');

const filled = buildCreateChemicalUseScenarioPayload(
  values({
    sectorSnapshot: ' Produção ',
    exposureGroupSnapshot: '1014',
    exposedRolesSnapshot: 'Operador',
    frequencyCount: '3',
    frequencyPeriod: 'Diário',
    durationMinutes: '10,5',
    peakContactMoment: 'Abertura do recipiente',
    controlMeasures: 'Luva e capela',
  }),
);
assert(filled.ok, 'campos operacionais preenchidos');
if (!filled.ok) throw new Error(filled.error);
assert(filled.body.sectorSnapshot === 'Produção', 'setor trim');
assert(filled.body.exposureGroupSnapshot === '1014', 'GSE textual');
assert(filled.body.frequencyCount === 3, 'freq nº number');
assert(filled.body.durationMinutes === 10.5, 'duração number com vírgula');
assert(filled.body.chemicalProductId !== '651ST', 'não usa nome como identidade');

assert(
  formatChemicalUseScenarioProductOption(product()) === '651ST · Fabricante A',
  'option com fabricante',
);
assert(
  formatChemicalUseScenarioProductOption(
    product({ manufacturer: null, tradeName: '910' }),
  ) === '910',
  'option sem fabricante',
);

assert(
  isChemicalUseScenarioSubmitBlocked({
    saving: true,
    values: values(),
  }),
  'submit bloqueado durante saving',
);
assert(
  !isChemicalUseScenarioSubmitBlocked({
    saving: false,
    values: values(),
  }),
  'submit liberado com produto e tarefa',
);
assert(
  isChemicalUseScenarioSubmitBlocked({
    saving: false,
    values: values({ activityName: '' }),
  }),
  'submit bloqueado sem tarefa',
);

let refreshCount = 0;
let createCalls = 0;

async function runSubmitCases() {
  const first = await submitCreateChemicalUseScenarioForm({
    saving: false,
    values: values({ activityName: 'Dosagem A' }),
    create: async () => {
      createCalls += 1;
    },
    onCreated: () => {
      refreshCount += 1;
    },
  });
  assert(first.status === 'ok', 'sucesso do create');
  assert(refreshCount === 1, 'sucesso dispara refresh');
  assert(createCalls === 1, 'um POST no primeiro create');

  const blocked = await submitCreateChemicalUseScenarioForm({
    saving: true,
    values: values(),
    create: async () => {
      createCalls += 1;
    },
    onCreated: () => {
      refreshCount += 1;
    },
  });
  assert(blocked.status === 'blocked', 'saving impede segundo clique');
  assert(createCalls === 1, 'saving não dispara POST extra');
  assert(refreshCount === 1, 'saving não dispara refresh extra');

  const secondSameTask = await submitCreateChemicalUseScenarioForm({
    saving: false,
    values: values({ activityName: 'Dosagem A' }),
    create: async () => {
      createCalls += 1;
    },
    onCreated: () => {
      refreshCount += 1;
    },
  });
  assert(secondSameTask.status === 'ok', 'segunda tarefa igual é permitida');
  assert(createCalls === 2, 'criação adicional não deduplica');
  assert(refreshCount === 2, 'segunda criação também dá refresh');
}

const pendingProductCreate = buildCreateChemicalUseScenarioPayload(
  values({
    product: product({ id: 'acticlor-uuid', tradeName: 'ACTICHLOR' }),
    activityName: 'Higienização',
  }),
);
assert(
  pendingProductCreate.ok,
  'produto ACTIVE sem cenário gera payload de SCENARIO real',
);
if (!pendingProductCreate.ok) throw new Error(pendingProductCreate.error);
assert(
  pendingProductCreate.body.chemicalProductId === 'acticlor-uuid',
  'próximo board GET recebe cenário do UUID existente',
);
assert(
  !('kind' in pendingProductCreate.body),
  'client não envia PENDING_SURVEY',
);

runSubmitCases()
  .then(() => {
    console.log('chemical-use-scenario-form.util.spec.ts: OK');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
