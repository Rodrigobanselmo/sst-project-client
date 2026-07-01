import { RiskSubTypeMasterRoutes } from '@v2/constants/routes/risk-sub-type-master.routes';
import { RiskSubtypeCurationRoutes } from '@v2/constants/routes/risk-subtype-curation.routes';
import { api } from 'core/services/apiClient';

import type {
  IPreviewRiskSubtypeCurationAiPromptParams,
  IRiskSubTypeAiInstruction,
  IRiskSubtypeCurationAiPromptPreview,
  IUpsertRiskSubTypeAiInstructionParams,
} from './risk-subtype-curation.types';

export async function readRiskSubTypeAiInstruction(
  subTypeId: number,
): Promise<IRiskSubTypeAiInstruction> {
  const response = await api.get<IRiskSubTypeAiInstruction>(
    RiskSubTypeMasterRoutes.AI_INSTRUCTION.replace(':id', String(subTypeId)),
  );
  return response.data;
}

export async function upsertRiskSubTypeAiInstruction(
  params: IUpsertRiskSubTypeAiInstructionParams,
): Promise<IRiskSubTypeAiInstruction> {
  const { subTypeId, ...body } = params;
  const response = await api.put<IRiskSubTypeAiInstruction>(
    RiskSubTypeMasterRoutes.AI_INSTRUCTION.replace(':id', String(subTypeId)),
    body,
  );
  return response.data;
}

export async function previewRiskSubtypeCurationAiPrompt(
  params: IPreviewRiskSubtypeCurationAiPromptParams,
): Promise<IRiskSubtypeCurationAiPromptPreview> {
  const response = await api.post<IRiskSubtypeCurationAiPromptPreview>(
    RiskSubtypeCurationRoutes.AI_PROMPT_PREVIEW,
    params,
  );
  return response.data;
}
