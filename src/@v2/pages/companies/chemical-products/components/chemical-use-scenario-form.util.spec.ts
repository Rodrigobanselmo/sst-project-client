/**
 * Executar: npx tsx src/@v2/pages/companies/chemical-products/components/chemical-use-scenario-form.util.spec.ts
 */
import type { ChemicalProductListItem } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import {
  buildCreateChemicalUseScenarioPayload,
  buildUpdateChemicalUseScenarioPayload,
  CHEMICAL_USE_SCENARIO_DURATION_ERROR,
  CHEMICAL_USE_SCENARIO_DURATION_HELPER,
  CHEMICAL_USE_SCENARIO_FREQUENCY_PERIODS,
  CHEMICAL_USE_SCENARIO_NUMERIC_ERROR,
  CHEMICAL_USE_SCENARIO_QUANTITY_UNITS,
  chemicalUseScenarioManualCreateHasForbiddenKeys,
  emptyChemicalUseScenarioFormValues,
  formatChemicalUseScenarioProductOption,
  formatManualChemicalUseScenarioQuantity,
  getChemicalUseScenarioDurationFieldState,
  getChemicalUseScenarioFrequencyFieldState,
  getChemicalUseScenarioQuantityFieldState,
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

const quantityNumeric = buildCreateChemicalUseScenarioPayload(
  values({ quantity: '25', quantityUnit: 'L' }),
);
assert(quantityNumeric.ok, 'quantity numérica aceita');
if (!quantityNumeric.ok) throw new Error(quantityNumeric.error);
assert(quantityNumeric.body.quantity === '25', 'quantity 25 vira string');
assert(quantityNumeric.body.quantityUnit === 'L', 'unidade textual');
assert(
  typeof quantityNumeric.body.quantity === 'string',
  'quantity continua string no payload',
);

const quantityComma = buildCreateChemicalUseScenarioPayload(
  values({ quantity: '10,5', quantityUnit: 'L' }),
);
assert(quantityComma.ok, 'quantity 10,5 aceita');
if (!quantityComma.ok) throw new Error(quantityComma.error);
assert(quantityComma.body.quantity === '10.5', 'quantity normaliza vírgula em string');
assert(
  typeof quantityComma.body.quantity === 'string',
  'quantity 10,5 permanece string',
);

const quantityFreeText = buildCreateChemicalUseScenarioPayload(
  values({ quantity: 'até 10', quantityUnit: 'L' }),
);
assert(!quantityFreeText.ok, 'quantity textual bloqueada no cadastro manual');

const quantityWithUnit = buildCreateChemicalUseScenarioPayload(
  values({ quantity: '25 litros', quantityUnit: 'L' }),
);
assert(!quantityWithUnit.ok, 'quantity com texto bloqueada no cadastro manual');

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
assert(
  !('homogeneousGroupId' in emptyOptionals.body),
  'create sem GSE real omite o FK',
);

const withRealGse = buildCreateChemicalUseScenarioPayload(
  values({
    homogeneousGroup: {
      id: 'gse-10009',
      name: 'GSE 10009 — Caldeira',
      deletedAt: null,
    },
    exposureGroupSnapshot: '10009',
  }),
);
assert(withRealGse.ok, 'create com GSE real opcional');
if (!withRealGse.ok) throw new Error(withRealGse.error);
assert(withRealGse.body.homogeneousGroupId === 'gse-10009', 'create envia FK');
assert(
  withRealGse.body.exposureGroupSnapshot === '10009',
  'GSE real não sobrescreve snapshot no create',
);

const unlinkUpdate = buildUpdateChemicalUseScenarioPayload(
  values({
    exposureGroupSnapshot: '10009',
    homogeneousGroup: null,
  }),
);
assert(unlinkUpdate.ok, 'update unlink válido');
if (!unlinkUpdate.ok) throw new Error(unlinkUpdate.error);
assert(unlinkUpdate.body.homogeneousGroupId === null, 'unlink envia null');
assert(
  unlinkUpdate.body.exposureGroupSnapshot === '10009',
  'unlink preserva snapshot',
);
assert(
  !('surveyStatus' in unlinkUpdate.body),
  'update não mexe em surveyStatus',
);

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

const durationWithUnit = values({ durationMinutes: '20 minutos' });
const durationWithUnitPayload =
  buildCreateChemicalUseScenarioPayload(durationWithUnit);
assert(!durationWithUnitPayload.ok, '"20 minutos" continua inválido');
assert(
  isChemicalUseScenarioSubmitBlocked({
    saving: false,
    values: durationWithUnit,
  }),
  '"20 minutos" continua bloqueando SALVAR',
);
assert(
  getChemicalUseScenarioDurationFieldState('20 minutos').error,
  '"20 minutos" marca duração com erro',
);
assert(
  getChemicalUseScenarioDurationFieldState('20 minutos').helperText ===
    CHEMICAL_USE_SCENARIO_DURATION_ERROR,
  '"20 minutos" mostra helper de erro',
);

const durationEmpty = getChemicalUseScenarioDurationFieldState('');
assert(!durationEmpty.error, 'duração vazia sem erro visual');
assert(
  durationEmpty.helperText === CHEMICAL_USE_SCENARIO_DURATION_HELPER,
  'duração vazia mostra orientação',
);

const durationNumber = getChemicalUseScenarioDurationFieldState('20');
assert(!durationNumber.error, '"20" sem erro visual');
assert(
  durationNumber.helperText === CHEMICAL_USE_SCENARIO_DURATION_HELPER,
  '"20" mostra orientação',
);
assert(
  !isChemicalUseScenarioSubmitBlocked({
    saving: false,
    values: values({ durationMinutes: '20' }),
  }),
  '"20" libera SALVAR',
);

const durationComma = getChemicalUseScenarioDurationFieldState('10,5');
assert(!durationComma.error, '"10,5" sem erro visual');
assert(
  !isChemicalUseScenarioSubmitBlocked({
    saving: false,
    values: values({ durationMinutes: '10,5' }),
  }),
  '"10,5" libera SALVAR',
);

const frequencyValid = getChemicalUseScenarioFrequencyFieldState('1');
assert(!frequencyValid.error, 'freq 1 sem erro visual');
assert(
  !isChemicalUseScenarioSubmitBlocked({
    saving: false,
    values: values({ frequencyCount: '1' }),
  }),
  'freq 1 libera SALVAR',
);

const frequencyComma = getChemicalUseScenarioFrequencyFieldState('1,5');
assert(!frequencyComma.error, 'freq 1,5 sem erro visual');
assert(
  !isChemicalUseScenarioSubmitBlocked({
    saving: false,
    values: values({ frequencyCount: '1,5' }),
  }),
  'freq 1,5 libera SALVAR',
);
const frequencyCommaPayload = buildCreateChemicalUseScenarioPayload(
  values({ frequencyCount: '1,5' }),
);
assert(frequencyCommaPayload.ok, 'freq 1,5 no payload');
if (!frequencyCommaPayload.ok) throw new Error(frequencyCommaPayload.error);
assert(frequencyCommaPayload.body.frequencyCount === 1.5, 'freq 1,5 → 1.5');

const frequencyEmpty = getChemicalUseScenarioFrequencyFieldState('');
assert(!frequencyEmpty.error, 'freq vazia sem erro visual');
assert(
  !isChemicalUseScenarioSubmitBlocked({
    saving: false,
    values: values({ frequencyCount: '' }),
  }),
  'freq vazia libera SALVAR',
);

const frequencyInvalid = getChemicalUseScenarioFrequencyFieldState('1 xxx');
assert(frequencyInvalid.error, 'freq 1 xxx marca erro');
assert(
  frequencyInvalid.helperText === CHEMICAL_USE_SCENARIO_NUMERIC_ERROR,
  'freq 1 xxx mostra helper numérico',
);
assert(
  isChemicalUseScenarioSubmitBlocked({
    saving: false,
    values: values({ frequencyCount: '1 xxx' }),
  }),
  'freq 1 xxx bloqueia SALVAR',
);

const quantityFieldValid = getChemicalUseScenarioQuantityFieldState('25');
assert(!quantityFieldValid.error, 'qtd 25 sem erro visual');
assert(
  !isChemicalUseScenarioSubmitBlocked({
    saving: false,
    values: values({ quantity: '25' }),
  }),
  'qtd 25 libera SALVAR',
);

const quantityFieldComma = getChemicalUseScenarioQuantityFieldState('10,5');
assert(!quantityFieldComma.error, 'qtd 10,5 sem erro visual');

const quantityFieldEmpty = getChemicalUseScenarioQuantityFieldState('');
assert(!quantityFieldEmpty.error, 'qtd vazia sem erro visual');
assert(
  !isChemicalUseScenarioSubmitBlocked({
    saving: false,
    values: values({ quantity: '' }),
  }),
  'qtd vazia libera SALVAR',
);

const quantityFieldLiters = getChemicalUseScenarioQuantityFieldState('25 litros');
assert(quantityFieldLiters.error, 'qtd 25 litros marca erro');
assert(
  quantityFieldLiters.helperText === CHEMICAL_USE_SCENARIO_NUMERIC_ERROR,
  'qtd 25 litros mostra helper numérico',
);
assert(
  isChemicalUseScenarioSubmitBlocked({
    saving: false,
    values: values({ quantity: '25 litros' }),
  }),
  'qtd 25 litros bloqueia SALVAR',
);

const quantityFieldUntil = getChemicalUseScenarioQuantityFieldState('até 10');
assert(quantityFieldUntil.error, 'qtd até 10 marca erro');
assert(
  isChemicalUseScenarioSubmitBlocked({
    saving: false,
    values: values({ quantity: 'até 10' }),
  }),
  'qtd até 10 bloqueia SALVAR',
);

const combinedInvalid = values({
  frequencyCount: '1 xxx',
  durationMinutes: '20 minutos',
  quantity: 'até 10',
});
assert(
  isChemicalUseScenarioSubmitBlocked({ saving: false, values: combinedInvalid }),
  'freq+duração+qtd inválidas bloqueiam SALVAR',
);

const combinedValid = values({
  frequencyCount: '1',
  frequencyPeriod: 'Semanal',
  durationMinutes: '20',
  quantity: '25',
  quantityUnit: 'L',
});
const combinedValidPayload = buildCreateChemicalUseScenarioPayload(combinedValid);
assert(combinedValidPayload.ok, 'caso do print com números puros é válido');
if (!combinedValidPayload.ok) throw new Error(combinedValidPayload.error);
assert(combinedValidPayload.body.frequencyCount === 1, 'payload freq 1');
assert(combinedValidPayload.body.frequencyPeriod === 'Semanal', 'payload período');
assert(combinedValidPayload.body.durationMinutes === 20, 'payload duração 20');
assert(combinedValidPayload.body.quantity === '25', 'payload qtd string 25');
assert(combinedValidPayload.body.quantityUnit === 'L', 'payload unidade L');
assert(
  !isChemicalUseScenarioSubmitBlocked({ saving: false, values: combinedValid }),
  'caso numérico válido libera SALVAR',
);

const emptyQuantityFormat = formatManualChemicalUseScenarioQuantity('');
assert(emptyQuantityFormat.ok, 'format qtd vazia ok');
if (!emptyQuantityFormat.ok) throw new Error('format qtd vazia');
assert(emptyQuantityFormat.value === null, 'format qtd vazia → null');
const invalidQuantityFormat = formatManualChemicalUseScenarioQuantity('abc');
assert(!invalidQuantityFormat.ok, 'format qtd abc inválido');

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
