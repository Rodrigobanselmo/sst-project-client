import {
  AI_MODEL_OPTIONS,
  type AiModelOption,
} from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/ai-model-options';

/**
 * Valores aceitos pela API (resolve-catalog-only-ai-model.util.ts).
 * Critério: Chat Completions + image_url + json_schema no OpenAIAiAdapter.
 *
 * Excluídos de AI_MODEL_OPTIONS:
 * - gpt-4o-2024-05-13: sem structured outputs (json_schema).
 * - o1-mini / o3-mini: text-only (sem fotos).
 * - o4-mini-deep-research: fora do contrato de identificação.
 */
export const CATALOG_ONLY_COMPATIBLE_AI_MODEL_VALUES = [
  'gpt-5',
  'gpt-5-mini',
  'gpt-5-nano',
  'gpt-4.1',
  'gpt-4.1-mini',
  'gpt-4.1-nano',
  'gpt-4o',
  'gpt-4o-mini',
  'o4-mini',
  'gpt-6.1-sol',
  'gpt-6-astra',
  'gpt-6-luna',
] as const;

export type CatalogOnlyCompatibleAiModel =
  (typeof CATALOG_ONLY_COMPATIBLE_AI_MODEL_VALUES)[number];

export const CATALOG_ONLY_AI_MODEL_SYSTEM_DEFAULT = '';

/** Espelha CATALOG_ONLY_DEFAULT_AI_MODEL da API (padrão oficial catalog-only). */
export const CATALOG_ONLY_DEFAULT_AI_MODEL = 'gpt-6.1-sol';

const compatibleSet = new Set<string>(CATALOG_ONLY_COMPATIBLE_AI_MODEL_VALUES);

const compatibleFromCentralList: AiModelOption[] = AI_MODEL_OPTIONS.filter(
  (option) => compatibleSet.has(option.value),
);

const additionalCompatibleOptions: AiModelOption[] = [
  { label: 'GPT-6.1 Sol', value: 'gpt-6.1-sol' },
  { label: 'GPT-6 Astra', value: 'gpt-6-astra' },
  { label: 'GPT-6 Luna', value: 'gpt-6-luna' },
];

export const CATALOG_ONLY_AI_MODEL_OPTIONS: AiModelOption[] = [
  {
    value: CATALOG_ONLY_AI_MODEL_SYSTEM_DEFAULT,
    label: 'Padrão do sistema (GPT-6.1 Sol)',
  },
  ...additionalCompatibleOptions,
  ...compatibleFromCentralList,
];

export type CatalogOnlyAiModelSessionValue = string;

export type CatalogOnlyAiModelSessionByKind = {
  gse: CatalogOnlyAiModelSessionValue;
  characterization: CatalogOnlyAiModelSessionValue;
};

export const CATALOG_ONLY_AI_MODEL_SESSION_DEFAULTS: CatalogOnlyAiModelSessionByKind =
  {
    gse: CATALOG_ONLY_AI_MODEL_SYSTEM_DEFAULT,
    characterization: CATALOG_ONLY_AI_MODEL_SYSTEM_DEFAULT,
  };

export function isCatalogOnlyCompatibleAiModel(
  model: string,
): model is CatalogOnlyCompatibleAiModel {
  return compatibleSet.has(model);
}

/** Só envia `model` no payload quando o master escolheu explicitamente. */
export function resolveCatalogOnlySessionModelForRequest(
  sessionValue: CatalogOnlyAiModelSessionValue | undefined | null,
): string | undefined {
  const trimmed = sessionValue?.trim();
  if (!trimmed) return undefined;
  // Client só oferece opções compatíveis; guard defensivo se estado ficar inválido.
  if (!isCatalogOnlyCompatibleAiModel(trimmed)) return undefined;
  return trimmed;
}
