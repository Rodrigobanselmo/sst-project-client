import type { SystemAiMasterConfig } from './system-ai-master-config.types';

export function buildMasterAiRequestOverrides(
  isMaster: boolean | undefined,
  config: SystemAiMasterConfig | undefined,
): Pick<SystemAiMasterConfig, 'customPrompt' | 'model'> {
  if (!isMaster || !config) return {};

  return {
    ...(config.customPrompt?.trim()
      ? { customPrompt: config.customPrompt.trim() }
      : {}),
    ...(config.model ? { model: config.model } : {}),
  };
}

export type { SystemAiMasterConfig } from './system-ai-master-config.types';
