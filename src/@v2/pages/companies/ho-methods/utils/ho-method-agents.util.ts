import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import type {
  HoMethodAgentPayload,
  HoMethodAgentRecord,
  HoMethodEvaluationConditionPayload,
  HoMethodRecord,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';
import { HoMethodAgentTypeEnum } from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';

import {
  inferEvaluationOptionsFromRisk,
  mapRiskSnapshotToRiskFactors,
  mapRiskTypeToAgentType,
} from './ho-method-evaluation.util';

export type MethodAgentFormItem = {
  localId: string;
  riskFactorId: string;
  agentName: string;
  cas: string;
  agentType: HoMethodAgentTypeEnum;
  risk: IRiskFactors;
  evaluationConditions: HoMethodEvaluationConditionPayload[];
};

const createLocalId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function createMethodAgentFromRisk(
  risk: IRiskFactors,
  existingConditions?: HoMethodEvaluationConditionPayload[],
): MethodAgentFormItem {
  const inferred = inferEvaluationOptionsFromRisk(risk).map((option) => ({
    evaluationType: option.evaluationType,
    limitValue: option.limitValue,
    limitUnit: option.limitUnit,
    flowRateUnit: 'L/min',
    volumeUnit: 'L',
  }));

  return {
    localId: createLocalId(),
    riskFactorId: risk.id,
    agentName: risk.name,
    cas: risk.cas ?? '',
    agentType: HoMethodAgentTypeEnum.CHEMICAL,
    risk,
    evaluationConditions:
      existingConditions && existingConditions.length > 0
        ? existingConditions
        : inferred,
  };
}

export function methodAgentsFromRecord(
  method: HoMethodRecord,
): MethodAgentFormItem[] {
  if (method.agents?.length) {
    return method.agents.map((agent) => {
      const risk =
        agent.riskFactor != null
          ? mapRiskSnapshotToRiskFactors(agent.riskFactor)
          : ({
              id: agent.riskFactorId,
              name: agent.agentName ?? '',
              cas: agent.cas ?? undefined,
            } as IRiskFactors);

      return {
        localId: agent.id,
        riskFactorId: agent.riskFactorId,
        agentName: agent.agentName ?? risk.name,
        cas: agent.cas ?? risk.cas ?? '',
        agentType: HoMethodAgentTypeEnum.CHEMICAL,
        risk,
        evaluationConditions: agent.evaluationConditions.map((item) => ({
          evaluationType: item.evaluationType,
          limitValue: item.limitValue,
          limitUnit: item.limitUnit,
          minimumFlowRate: item.minimumFlowRate,
          maximumFlowRate: item.maximumFlowRate,
          minimumVolume: item.minimumVolume,
          maximumVolume: item.maximumVolume,
          flowRateUnit: item.flowRateUnit,
          volumeUnit: item.volumeUnit,
          notes: item.notes,
        })),
      };
    });
  }

  if (method.riskFactorId && method.riskFactor) {
    return [
      createMethodAgentFromRisk(
        mapRiskSnapshotToRiskFactors(method.riskFactor),
        method.evaluationConditions.map((item) => ({
          evaluationType: item.evaluationType,
          limitValue: item.limitValue,
          limitUnit: item.limitUnit,
          minimumFlowRate: item.minimumFlowRate,
          maximumFlowRate: item.maximumFlowRate,
          minimumVolume: item.minimumVolume,
          maximumVolume: item.maximumVolume,
          flowRateUnit: item.flowRateUnit,
          volumeUnit: item.volumeUnit,
          notes: item.notes,
        })),
      ),
    ];
  }

  return [];
}

export function buildAgentsPayload(
  agents: MethodAgentFormItem[],
): HoMethodAgentPayload[] {
  return agents.map((agent) => ({
    riskFactorId: agent.riskFactorId,
    agentName: agent.agentName,
    cas: agent.cas,
    agentType: agent.agentType,
    evaluationConditions: agent.evaluationConditions,
  }));
}

export function syncLegacyAgentFields(agents: MethodAgentFormItem[]) {
  const primary = agents[0];
  if (!primary) {
    return {
      riskFactorId: null,
      agentName: '',
      cas: '',
      agentType: HoMethodAgentTypeEnum.CHEMICAL,
      evaluationConditions: [] as HoMethodEvaluationConditionPayload[],
    };
  }

  return {
    riskFactorId: primary.riskFactorId,
    agentName: primary.agentName,
    cas: primary.cas,
    agentType: primary.agentType,
    evaluationConditions: primary.evaluationConditions,
  };
}
