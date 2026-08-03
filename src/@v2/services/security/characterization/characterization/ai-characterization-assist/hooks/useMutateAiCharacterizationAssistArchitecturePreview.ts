import { useMutation } from '@tanstack/react-query';

import { aiCharacterizationAssistArchitecturePreview } from '../service/ai-characterization-assist.service';
import type { AiCharacterizationAssistArchitecturePreviewParams } from '../service/ai-characterization-assist-architecture-preview.types';

export const useMutateAiCharacterizationAssistArchitecturePreview = () => {
  return useMutation({
    mutationFn: (params: AiCharacterizationAssistArchitecturePreviewParams) =>
      aiCharacterizationAssistArchitecturePreview(params),
  });
};
