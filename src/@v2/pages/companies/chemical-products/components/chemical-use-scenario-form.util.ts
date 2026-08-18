import type {
  ChemicalProductListItem,
  CreateChemicalUseScenarioPayload,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

export type ChemicalUseScenarioFormMode = 'create' | 'edit';

export type ChemicalUseScenarioFormValues = {
  product: ChemicalProductListItem | null;
  activityName: string;
  sectorSnapshot: string;
  exposureGroupSnapshot: string;
  exposedRolesSnapshot: string;
  frequencyCount: string;
  frequencyPeriod: string;
  durationMinutes: string;
  quantity: string;
  quantityUnit: string;
  peakContactMoment: string;
  controlMeasures: string;
};

export const MANUAL_USE_SCENARIO_SURVEY_STATUS =
  'LEVANTAMENTO_CONCLUIDO' as const;

/** Períodos já persistidos por SURVEY/TECHNICAL — não inventar novos rótulos. */
export const CHEMICAL_USE_SCENARIO_FREQUENCY_PERIODS = [
  'Diário',
  'Semanal',
  'Quinzenal',
  'Mensal',
  'Semestre',
] as const;

/** Unidades já persistidas por SURVEY/TECHNICAL — manter grafia existente. */
export const CHEMICAL_USE_SCENARIO_QUANTITY_UNITS = [
  'mL',
  'L',
  'litros',
  'Kg',
] as const;

const FORBIDDEN_MANUAL_CREATE_KEYS = [
  'sourceSheet',
  'sourceRows',
  'sourceRaw',
  'sourceProductLabel',
  'linachHint',
  'relevanceHint',
  'notes',
  'fingerprint',
  'composition',
  'ingredient',
  'riskFactor',
  'source',
] as const;

export function emptyChemicalUseScenarioFormValues(): ChemicalUseScenarioFormValues {
  return {
    product: null,
    activityName: '',
    sectorSnapshot: '',
    exposureGroupSnapshot: '',
    exposedRolesSnapshot: '',
    frequencyCount: '',
    frequencyPeriod: '',
    durationMinutes: '',
    quantity: '',
    quantityUnit: '',
    peakContactMoment: '',
    controlMeasures: '',
  };
}

export function formatChemicalUseScenarioProductOption(
  product: Pick<ChemicalProductListItem, 'tradeName' | 'manufacturer'>,
) {
  const tradeName = product.tradeName?.trim() || '';
  const manufacturer = product.manufacturer?.trim();
  return manufacturer ? `${tradeName} · ${manufacturer}` : tradeName;
}

export function isActiveChemicalProduct(
  product: Pick<ChemicalProductListItem, 'status'> | null,
) {
  return Boolean(product && product.status === 'ACTIVE');
}

function trimToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseOptionalNumber(
  value: string,
): { ok: true; value: number | null } | { ok: false } {
  const trimmed = value.trim().replace(',', '.');
  if (!trimmed) return { ok: true, value: null };
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return { ok: false };
  return { ok: true, value: parsed };
}

function isAllowedSelectValue(value: string, options: readonly string[]) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return options.some((option) => option === trimmed);
}

export type BuildCreateChemicalUseScenarioResult =
  | { ok: true; body: CreateChemicalUseScenarioPayload }
  | { ok: false; error: string };

export function buildCreateChemicalUseScenarioPayload(
  values: ChemicalUseScenarioFormValues,
): BuildCreateChemicalUseScenarioResult {
  if (!values.product?.id || !isActiveChemicalProduct(values.product)) {
    return { ok: false, error: 'Selecione um produto químico existente.' };
  }

  const activityName = values.activityName.trim();
  if (!activityName) {
    return { ok: false, error: 'Informe a tarefa/atividade.' };
  }

  const frequencyCount = parseOptionalNumber(values.frequencyCount);
  if (!frequencyCount.ok) {
    return { ok: false, error: 'Frequência nº inválida.' };
  }

  const durationMinutes = parseOptionalNumber(values.durationMinutes);
  if (!durationMinutes.ok) {
    return { ok: false, error: 'Duração inválida.' };
  }

  if (
    !isAllowedSelectValue(
      values.frequencyPeriod,
      CHEMICAL_USE_SCENARIO_FREQUENCY_PERIODS,
    )
  ) {
    return { ok: false, error: 'Selecione um período de frequência válido.' };
  }

  if (
    !isAllowedSelectValue(
      values.quantityUnit,
      CHEMICAL_USE_SCENARIO_QUANTITY_UNITS,
    )
  ) {
    return { ok: false, error: 'Selecione uma unidade válida.' };
  }

  return {
    ok: true,
    body: {
      chemicalProductId: values.product.id,
      surveyStatus: MANUAL_USE_SCENARIO_SURVEY_STATUS,
      activityName,
      sectorSnapshot: trimToNull(values.sectorSnapshot),
      exposureGroupSnapshot: trimToNull(values.exposureGroupSnapshot),
      exposedRolesSnapshot: trimToNull(values.exposedRolesSnapshot),
      frequencyCount: frequencyCount.value,
      frequencyPeriod: trimToNull(values.frequencyPeriod),
      durationMinutes: durationMinutes.value,
      quantity: trimToNull(values.quantity),
      quantityUnit: trimToNull(values.quantityUnit),
      peakContactMoment: trimToNull(values.peakContactMoment),
      controlMeasures: trimToNull(values.controlMeasures),
    },
  };
}

export function chemicalUseScenarioManualCreateKeys(
  body: CreateChemicalUseScenarioPayload,
) {
  return Object.keys(body);
}

export function chemicalUseScenarioManualCreateHasForbiddenKeys(
  body: CreateChemicalUseScenarioPayload,
) {
  const keys = new Set(chemicalUseScenarioManualCreateKeys(body));
  return FORBIDDEN_MANUAL_CREATE_KEYS.filter((key) => keys.has(key));
}

export function isChemicalUseScenarioSubmitBlocked(params: {
  saving: boolean;
  values: ChemicalUseScenarioFormValues;
}) {
  if (params.saving) return true;
  return !buildCreateChemicalUseScenarioPayload(params.values).ok;
}

export async function submitCreateChemicalUseScenarioForm(params: {
  saving: boolean;
  values: ChemicalUseScenarioFormValues;
  create: (body: CreateChemicalUseScenarioPayload) => Promise<unknown>;
  onCreated: () => void;
}): Promise<
  | { status: 'blocked' }
  | { status: 'invalid'; error: string }
  | { status: 'error'; error: string }
  | { status: 'ok' }
> {
  if (params.saving) return { status: 'blocked' };
  const built = buildCreateChemicalUseScenarioPayload(params.values);
  if (!built.ok) return { status: 'invalid', error: built.error };
  try {
    await params.create(built.body);
    params.onCreated();
    return { status: 'ok' };
  } catch (err: unknown) {
    const payload = (err as { response?: { data?: { message?: unknown } } })
      ?.response?.data;
    const message = payload?.message;
    return {
      status: 'error',
      error:
        typeof message === 'string'
          ? message
          : 'Não foi possível criar o cenário de uso.',
    };
  }
}
