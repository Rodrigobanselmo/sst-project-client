import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  previewRiskSubtypeCurationAiPrompt,
  readRiskSubTypeAiInstruction,
  upsertRiskSubTypeAiInstruction,
} from '../risk-subtype-curation-ai.service';
import type {
  IPreviewRiskSubtypeCurationAiPromptParams,
  IRiskSubTypeAiInstruction,
  IUpsertRiskSubTypeAiInstructionParams,
} from '../risk-subtype-curation.types';

const instructionKey = (subTypeId: number) => [
  'risk-subtype-ai-instruction',
  subTypeId,
];

export function useFetchRiskSubTypeAiInstruction(subTypeId?: number, enabled = true) {
  return useQuery({
    queryKey: instructionKey(subTypeId ?? 0),
    queryFn: () => readRiskSubTypeAiInstruction(subTypeId as number),
    enabled: enabled && Boolean(subTypeId),
  });
}

export function useMutateUpsertRiskSubTypeAiInstruction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: IUpsertRiskSubTypeAiInstructionParams) =>
      upsertRiskSubTypeAiInstruction(params),
    onSuccess: (data: IRiskSubTypeAiInstruction) => {
      queryClient.setQueryData(instructionKey(data.subTypeId), data);
    },
  });
}

export function useMutatePreviewRiskSubtypeCurationAiPrompt() {
  return useMutation({
    mutationFn: (params: IPreviewRiskSubtypeCurationAiPromptParams) =>
      previewRiskSubtypeCurationAiPrompt(params),
  });
}
