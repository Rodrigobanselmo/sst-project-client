import type {
  HoMethodImportParseResult,
  HoMethodWritePayload,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';
import {
  HoMethodAvailabilityStatusEnum,
  HoMethodEvaluationTypeEnum,
  HoMethodSourceEnum,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';

import {
  buildAgentsPayload,
  createMethodAgentFromRisk,
  syncLegacyAgentFields,
  type MethodAgentFormItem,
} from './ho-method-agents.util';
import { mapRiskSnapshotToRiskFactors } from './ho-method-evaluation.util';

const formatImportNumber = (value: number | null | undefined) => {
  if (value == null) return '';
  return String(value).replace('.', ',');
};

export type HoMethodImportFormState = {
  institution: HoMethodSourceEnum;
  methodCode: string;
  methodVersion: string;
  displayName: string;
  analyticalMethod: string;
  samplerName: string;
  minimumFlowRate: string;
  maximumFlowRate: string;
  flowRateUnit: string;
  minimumVolume: string;
  maximumVolume: string;
  volumeUnit: string;
  shipment: string;
  stabilityDays: string;
  stabilityText: string;
  storageTemperature: string;
  storageTemperatureUnit: string;
  extractionSolvent: string;
  technique: string;
  analyte: string;
  detector: string;
  lod: string;
  range: string;
  applicability: string;
  interferences: string;
  observations: string;
  evaluation: string;
  issueDate: string;
  notes: string;
};

export function importFormFromParseResult(
  result: HoMethodImportParseResult,
): HoMethodImportFormState {
  const f = result.fields;

  return {
    institution:
      (f.institution.value as HoMethodSourceEnum) ?? HoMethodSourceEnum.NIOSH,
    methodCode: f.methodCode.value ?? '',
    methodVersion: f.methodVersion.value ?? '',
    displayName: f.displayName.value ?? '',
    analyticalMethod: f.analyticalMethod.value ?? f.technique.value ?? '',
    samplerName: f.sampler.value ?? '',
    minimumFlowRate: formatImportNumber(f.minimumFlowRate.value),
    maximumFlowRate: formatImportNumber(f.maximumFlowRate.value),
    flowRateUnit: f.flowRateUnit.value ?? 'L/min',
    minimumVolume: formatImportNumber(f.minimumVolume.value),
    maximumVolume: formatImportNumber(f.maximumVolume.value),
    volumeUnit: f.volumeUnit.value ?? 'L',
    shipment: f.shipment.value ?? '',
    stabilityDays: formatImportNumber(f.stabilityDays.value),
    stabilityText: f.stabilityText.value ?? '',
    storageTemperature: formatImportNumber(f.storageTemperature.value),
    storageTemperatureUnit: f.storageTemperatureUnit.value ?? '°C',
    extractionSolvent: f.extractionSolvent.value ?? '',
    technique: f.technique.value ?? '',
    analyte: f.analyte.value ?? '',
    detector: f.detector.value ?? '',
    lod: f.lod.value ?? '',
    interferences: f.interferences.value ?? '',
    applicability: f.applicability.value ?? '',
    range: f.range.value ?? '',
    observations: f.observations.value ?? '',
    evaluation: f.evaluation.value ?? '',
    issueDate: f.issueDate.value ?? '',
    notes: buildImportNotes(result),
  };
}

function buildImportNotes(result: HoMethodImportParseResult) {
  const parts: string[] = [];
  const f = result.fields;

  if (f.issueDate.value) parts.push(`Issue date: ${f.issueDate.value}`);
  if (f.evaluation.value) parts.push(`Evaluation: ${f.evaluation.value}`);
  if (f.sampler.value) parts.push(`Sampler: ${f.sampler.value}`);
  if (f.extractionSolvent.value) {
    parts.push(`Desorption: ${f.extractionSolvent.value}`);
  }
  if (f.stabilityText.value) parts.push(`Stability: ${f.stabilityText.value}`);
  if (f.shipment.value) parts.push(`Shipment: ${f.shipment.value}`);
  if (f.lod.value) parts.push(`LOD: ${f.lod.value}`);
  if (f.range.value) parts.push(`Range: ${f.range.value}`);
  if (f.applicability.value) parts.push(`Applicability: ${f.applicability.value}`);
  if (f.interferences.value) parts.push(`Interferences: ${f.interferences.value}`);
  if (f.observations.value) parts.push(`Observations: ${f.observations.value}`);

  return parts.join('\n');
}

const hasSpecificSampling = (
  sampling: HoMethodImportParseResult['agents'][number]['sampling'],
) =>
  Boolean(
    sampling &&
      [
        sampling.minimumFlowRate,
        sampling.maximumFlowRate,
        sampling.minimumVolume,
        sampling.maximumVolume,
      ].some((value) => value != null),
  );

const applyCollectedSampling = (
  condition: MethodAgentFormItem['evaluationConditions'][number],
  result: HoMethodImportParseResult,
  sampling: HoMethodImportParseResult['agents'][number]['sampling'],
) => {
  if (hasSpecificSampling(sampling) && sampling) {
    return {
      ...condition,
      minimumFlowRate: sampling.minimumFlowRate,
      maximumFlowRate: sampling.maximumFlowRate,
      minimumVolume: sampling.minimumVolume,
      maximumVolume: sampling.maximumVolume,
      flowRateUnit: sampling.flowRateUnit ?? condition.flowRateUnit ?? 'L/min',
      volumeUnit: sampling.volumeUnit ?? condition.volumeUnit ?? 'L',
    };
  }

  return {
    ...condition,
    minimumFlowRate: condition.minimumFlowRate ?? result.fields.minimumFlowRate.value,
    maximumFlowRate: condition.maximumFlowRate ?? result.fields.maximumFlowRate.value,
    minimumVolume: condition.minimumVolume ?? result.fields.minimumVolume.value,
    maximumVolume: condition.maximumVolume ?? result.fields.maximumVolume.value,
    flowRateUnit: condition.flowRateUnit ?? result.fields.flowRateUnit.value ?? 'L/min',
    volumeUnit: condition.volumeUnit ?? result.fields.volumeUnit.value ?? 'L',
  };
};

const materializeAgent = (
  result: HoMethodImportParseResult,
  agent: HoMethodImportParseResult['agents'][number],
  risk: ReturnType<typeof mapRiskSnapshotToRiskFactors>,
) => {
  const item = createMethodAgentFromRisk(risk);
  const sampling = agent.sampling;

  if (item.evaluationConditions.length === 0) {
    item.evaluationConditions = [
      applyCollectedSampling(
        {
          evaluationType: HoMethodEvaluationTypeEnum.OTHER,
          notes: result.fields.evaluation.value
            ? `NIOSH evaluation: ${result.fields.evaluation.value}`
            : 'Importado de PDF NIOSH/NMAM',
          flowRateUnit: 'L/min',
          volumeUnit: 'L',
        },
        result,
        sampling,
      ),
    ];
  } else {
    item.evaluationConditions = item.evaluationConditions.map((condition) =>
      applyCollectedSampling(condition, result, sampling),
    );
  }

  return item;
};

export function agentHasSelectedRiskLink(
  agent: Pick<HoMethodImportParseResult['agents'][number], 'riskLinks' | 'matchedRiskFactor'>,
) {
  if (agent.riskLinks?.some((link) => link.selected)) return true;
  return Boolean(agent.matchedRiskFactor) && !agent.riskLinks?.length;
}

export function refreshImportConfirmState(
  result: HoMethodImportParseResult,
): HoMethodImportParseResult {
  const agents = result.agents.map((agent) => {
    const selected = (agent.riskLinks ?? []).filter((link) => link.selected);
    return {
      ...agent,
      found: agentHasSelectedRiskLink(agent),
      matchedRiskFactor: selected[0]?.riskFactor ?? (agent.riskLinks?.length ? null : agent.matchedRiskFactor),
      matchConfidence: agentHasSelectedRiskLink(agent)
        ? 'high'
        : agent.approximateCandidates?.length
          ? 'low'
          : 'none',
    } as HoMethodImportParseResult['agents'][number];
  });
  const unmatched = agents.filter((agent) => !agent.found);
  const canConfirm =
    result.isSupportedMethod &&
    Boolean(result.fields.methodCode.value) &&
    agents.length > 0 &&
    unmatched.length === 0;

  return {
    ...result,
    agents,
    canConfirm,
    confirmBlockReason: !result.isSupportedMethod
      ? 'O PDF não parece ser um método NIOSH/NMAM suportado.'
      : !result.fields.methodCode.value
        ? 'Informe ou confirme o código do método antes de importar.'
        : agents.length === 0
          ? 'Nenhum agente identificado para importação.'
          : unmatched.length > 0
            ? 'Vincule todos os agentes a fatores de risco químicos cadastrados antes de confirmar.'
            : null,
  };
}

export function importAgentsFromParseResult(
  result: HoMethodImportParseResult,
): MethodAgentFormItem[] {
  const seen = new Set<string>();
  const items: MethodAgentFormItem[] = [];

  result.agents.forEach((agent) => {
    const selectedLinks = (agent.riskLinks ?? []).filter((link) => link.selected);
    const links = selectedLinks.length
      ? selectedLinks
      : agent.matchedRiskFactor && !agent.riskLinks?.length
        ? [
            {
              riskFactor: agent.matchedRiskFactor,
              reasons: [],
              coverageTerms: [],
              selected: true,
            },
          ]
        : [];

    links.forEach((link) => {
      if (seen.has(link.riskFactor.id)) return;
      seen.add(link.riskFactor.id);
      items.push(
        materializeAgent(result, agent, mapRiskSnapshotToRiskFactors(link.riskFactor)),
      );
    });
  });

  return items;
}

export const parseOptionalNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

export function buildImportSubmitPayload(params: {
  form: HoMethodImportFormState;
  agents: MethodAgentFormItem[];
  fileUpload: {
    fileId: string;
    name: string;
    uploadedAt: string;
  };
}): HoMethodWritePayload {
  const parseOptionalInt = (value: string) => {
    const parsed = parseOptionalNumber(value);
    return parsed == null ? null : Math.round(parsed);
  };

  const agentsPayload = buildAgentsPayload(params.agents);
  const legacy = syncLegacyAgentFields(params.agents);

  return {
    displayName: params.form.displayName.trim(),
    description: params.form.analyte.trim() || null,
    institution: params.form.institution,
    methodCode: params.form.methodCode.trim(),
    methodVersion: params.form.methodVersion.trim() || null,
    analyticalMethod: params.form.analyticalMethod.trim() || null,
    prioritized: false,
    status: HoMethodAvailabilityStatusEnum.ACTIVE,
    minimumFlowRate: parseOptionalNumber(params.form.minimumFlowRate),
    maximumFlowRate: parseOptionalNumber(params.form.maximumFlowRate),
    minimumVolume: parseOptionalNumber(params.form.minimumVolume),
    maximumVolume: parseOptionalNumber(params.form.maximumVolume),
    flowRateUnit: params.form.flowRateUnit.trim() || 'L/min',
    volumeUnit: params.form.volumeUnit.trim() || 'L',
    storageTemperature: parseOptionalNumber(params.form.storageTemperature),
    storageTemperatureUnit: params.form.storageTemperatureUnit.trim() || '°C',
    stabilityDays: parseOptionalInt(params.form.stabilityDays),
    originalDocumentFileId: params.fileUpload.fileId,
    originalDocumentName: params.fileUpload.name,
    originalDocumentUploadedAt: params.fileUpload.uploadedAt,
    notes: params.form.notes.trim() || null,
    agents: agentsPayload,
    ...legacy,
    evaluationConditions: legacy.evaluationConditions,
    laboratories: [],
  };
}

export function allImportAgentsLinked(result: HoMethodImportParseResult) {
  return (
    result.agents.length > 0 &&
    result.agents.every((agent) => agentHasSelectedRiskLink(agent))
  );
}

export const IMPORT_CONFIDENCE_LABELS = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
} as const;
