export type AiModelOption = {
  label: string;
  value: string;
};

export const AI_MODEL_OPTIONS: AiModelOption[] = [
  { label: 'GPT-5 (Premium) - $0.625/$5.00', value: 'gpt-5' },
  { label: 'GPT-5 Mini (Balanceado) - $0.125/$1.00', value: 'gpt-5-mini' },
  { label: 'GPT-5 Nano (Ultra Rápido) - $0.025/$0.20', value: 'gpt-5-nano' },
  { label: 'GPT-4.1 (Avançado) - $1.00/$4.00', value: 'gpt-4.1' },
  { label: 'GPT-4.1 Mini (Eficiente) - $0.20/$0.80', value: 'gpt-4.1-mini' },
  { label: 'GPT-4.1 Nano (Econômico) - $0.05/$0.20', value: 'gpt-4.1-nano' },
  { label: 'GPT-4o (Padrão) - $1.25/$5.00', value: 'gpt-4o' },
  {
    label: 'GPT-4o 2024-05-13 (Versão Específica) - $2.50/$7.50',
    value: 'gpt-4o-2024-05-13',
  },
  { label: 'GPT-4o Mini (Rápido) - $0.075/$0.30', value: 'gpt-4o-mini' },
  { label: 'O1 Mini (Raciocínio Rápido) - $0.55/$2.20', value: 'o1-mini' },
  { label: 'O3 Mini (Análise Rápida) - $0.55/$2.20', value: 'o3-mini' },
  { label: 'O4 Mini (Nova Geração) - $0.55/$2.20', value: 'o4-mini' },
  {
    label: 'O4 Mini Deep Research (Pesquisa Nova Geração) - $1.00/$4.00',
    value: 'o4-mini-deep-research',
  },
];

