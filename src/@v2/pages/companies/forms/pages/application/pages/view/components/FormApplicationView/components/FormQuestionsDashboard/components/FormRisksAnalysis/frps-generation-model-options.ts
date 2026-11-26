import type { AiModelOption } from './ai-model-options';

export const FRPS_GENERATION_DEFAULT_MODEL = 'gpt-6.1-sol';
export const FRPS_GENERATION_MODEL_OPTIONS: AiModelOption[] = [
  { label: 'GPT-6.1 Sol — Padrão do sistema', value: FRPS_GENERATION_DEFAULT_MODEL },
  { label: 'GPT-6.2 Sol', value: 'gpt-6.2-sol' },
  { label: 'GPT-6.2 Astra', value: 'gpt-6.2-astra' },
];
