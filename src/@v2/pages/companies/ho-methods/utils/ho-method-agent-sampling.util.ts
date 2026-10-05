import type { HoMethodEvaluationConditionPayload } from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';

export type AgentCollectionSampling = {
  minimumFlowRate: number | null;
  maximumFlowRate: number | null;
  flowRateUnit: string | null;
  minimumVolume: number | null;
  maximumVolume: number | null;
  volumeUnit: string | null;
};

const NUMBER_KEYS = [
  'minimumFlowRate',
  'maximumFlowRate',
  'minimumVolume',
  'maximumVolume',
] as const;

const readSampling = (
  condition: HoMethodEvaluationConditionPayload,
): AgentCollectionSampling => ({
  minimumFlowRate: condition.minimumFlowRate ?? null,
  maximumFlowRate: condition.maximumFlowRate ?? null,
  flowRateUnit: condition.flowRateUnit ?? null,
  minimumVolume: condition.minimumVolume ?? null,
  maximumVolume: condition.maximumVolume ?? null,
  volumeUnit: condition.volumeUnit ?? null,
});

const hasCollectionValue = (sampling: AgentCollectionSampling) =>
  NUMBER_KEYS.some((key) => sampling[key] != null);

const sameSampling = (left: AgentCollectionSampling, right: AgentCollectionSampling) =>
  NUMBER_KEYS.every((key) => left[key] === right[key]) &&
  (left.flowRateUnit ?? null) === (right.flowRateUnit ?? null) &&
  (left.volumeUnit ?? null) === (right.volumeUnit ?? null);

export type DerivedAgentCollection =
  | { kind: 'absent' }
  | { kind: 'uniform'; sampling: AgentCollectionSampling }
  | { kind: 'mixed'; sampling: AgentCollectionSampling };

export function deriveAgentCollection(
  conditions: HoMethodEvaluationConditionPayload[],
): DerivedAgentCollection {
  const present = conditions
    .map(readSampling)
    .filter((sampling) => hasCollectionValue(sampling));

  if (!present.length) return { kind: 'absent' };

  const [first] = present;
  const uniform = present.every((sampling) => sameSampling(sampling, first));
  return uniform
    ? { kind: 'uniform', sampling: first }
    : { kind: 'mixed', sampling: first };
}

export function applyAgentCollection(
  conditions: HoMethodEvaluationConditionPayload[],
  patch: Partial<AgentCollectionSampling>,
): HoMethodEvaluationConditionPayload[] {
  return conditions.map((condition) => ({
    ...condition,
    ...patch,
  }));
}

export function shouldShowMethodLevelFlowFields(params: {
  methodFlowValues: Array<string | null | undefined>;
  agents: Array<{ evaluationConditions: HoMethodEvaluationConditionPayload[] }>;
}) {
  const methodHasGeneralFlow = params.methodFlowValues.some(
    (value) => Boolean(value?.trim()),
  );
  if (methodHasGeneralFlow) return true;

  return !params.agents.some(
    (agent) => deriveAgentCollection(agent.evaluationConditions).kind !== 'absent',
  );
}

const formatSamplingNumber = (value: number | null) =>
  value == null ? '' : String(value).replace('.', ',');

export function formatAgentCollectionLine(sampling: AgentCollectionSampling) {
  const flowUnit = sampling.flowRateUnit?.trim() || '';
  const volumeUnit = sampling.volumeUnit?.trim() || '';
  const parts: string[] = [];

  if (sampling.minimumFlowRate != null) {
    parts.push(
      `vazão mín. ${formatSamplingNumber(sampling.minimumFlowRate)}${flowUnit ? ` ${flowUnit}` : ''}`,
    );
  }
  if (sampling.maximumFlowRate != null) {
    parts.push(
      `vazão máx. ${formatSamplingNumber(sampling.maximumFlowRate)}${flowUnit ? ` ${flowUnit}` : ''}`,
    );
  }

  const minVolume = formatSamplingNumber(sampling.minimumVolume);
  const maxVolume = formatSamplingNumber(sampling.maximumVolume);
  if (minVolume && maxVolume) {
    parts.push(`volume ${minVolume}–${maxVolume}${volumeUnit ? ` ${volumeUnit}` : ''}`);
  } else if (minVolume) {
    parts.push(`volume mín. ${minVolume}${volumeUnit ? ` ${volumeUnit}` : ''}`);
  } else if (maxVolume) {
    parts.push(`volume máx. ${maxVolume}${volumeUnit ? ` ${volumeUnit}` : ''}`);
  }

  return parts.join('; ');
}

export function parseAgentCollectionNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalized)) return undefined;
  return Number(normalized);
}
