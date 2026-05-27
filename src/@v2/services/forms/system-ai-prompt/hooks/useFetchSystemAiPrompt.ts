import { useFetch } from '@v2/hooks/api/useFetch';
import { SystemAiPromptKeyEnum } from '@v2/constants/enums/system-ai-prompt-key.enum';
import { readSystemAiPrompt } from '../service/system-ai-prompt.service';

export const useFetchSystemAiPrompt = (
  key: SystemAiPromptKeyEnum,
  enabled = true,
) => {
  return useFetch({
    queryKey: ['system-ai-prompt', key],
    queryFn: () => readSystemAiPrompt({ key }),
    enabled,
  });
};
