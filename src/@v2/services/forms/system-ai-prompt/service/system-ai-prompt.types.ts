import { SystemAiPromptKeyEnum } from '@v2/constants/enums/system-ai-prompt-key.enum';

export type SystemAiPromptResult = {
  key: SystemAiPromptKeyEnum;
  content: string;
  revision: number;
  updatedBy: number | null;
  updatedAt: string;
  isPersistedDefault: boolean;
};

export type ReadSystemAiPromptParams = {
  key: SystemAiPromptKeyEnum;
};

export type UpsertSystemAiPromptParams = {
  key: SystemAiPromptKeyEnum;
  content: string;
};
