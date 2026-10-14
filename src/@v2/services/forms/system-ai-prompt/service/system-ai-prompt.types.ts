import { SystemAiPromptKeyEnum } from '@v2/constants/enums/system-ai-prompt-key.enum';

export type SystemAiPromptUpsertAction = 'save' | 'promote' | 'restore';

export type SystemAiPromptResult = {
  key: SystemAiPromptKeyEnum;
  content: string;
  defaultContent: string;
  officialDefaultContent: string | null;
  hasOfficialDefault: boolean;
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
  /** Obrigatório em action save (default). */
  content?: string;
  changeReason?: string;
  /** Default save — compatível com demais engrenagens. */
  action?: SystemAiPromptUpsertAction;
};
