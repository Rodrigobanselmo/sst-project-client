export const CHARACTERIZATION_AI_SPECIALIST_CATEGORIES = [
  'Caracterização Geral',
  'Ergonomia',
  'Equipamentos e Máquinas',
  'Processos e Atividades',
  'Ambientes Administrativos',
  'Ambientes Industriais',
  'Ambientes Rurais',
  'Ambientes Hospitalares e Laboratoriais',
  'Offshore e Marítimo',
  'Outro',
] as const;

export type CharacterizationAiSpecialistCategory =
  (typeof CHARACTERIZATION_AI_SPECIALIST_CATEGORIES)[number];
