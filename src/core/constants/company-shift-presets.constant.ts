export type CompanyShiftPreset = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
};

/** Atalhos de preenchimento no client. Não são persistidos automaticamente. */
export const COMPANY_SHIFT_PRESETS: readonly CompanyShiftPreset[] = [
  {
    id: 'padrao-8h',
    name: 'Jornada Padrão — 8 horas',
    description: 'Jornada padrão de 8 horas diárias.',
    durationMinutes: 480,
  },
  {
    id: '8h-revezamento',
    name: 'Jornada de 8 horas — Revezamento',
    description:
      'Jornada de 8 horas em regime de revezamento entre turmas. Exemplo: 08h às 16h, 16h às 24h e 00h às 08h. Ajuste os horários conforme a escala praticada pela empresa.',
    durationMinutes: 480,
  },
  {
    id: '6h-fixa',
    name: 'Jornada de 6 horas — Fixa',
    description:
      'Jornada fixa de 6 horas. Informe o horário praticado, por exemplo: 06h às 12h.',
    durationMinutes: 360,
  },
  {
    id: '6h-revezamento',
    name: 'Jornada de 6 horas — Revezamento',
    description:
      'Jornada de 6 horas em regime de revezamento entre turmas. Exemplo: 00h às 06h, 06h às 12h, 12h às 18h e 18h às 24h. Ajuste os horários conforme a escala praticada pela empresa.',
    durationMinutes: 360,
  },
  {
    id: 'diurna-12h',
    name: 'Jornada Diurna — 12 horas',
    description:
      'Jornada fixa de 12 horas em período diurno. Informe o horário praticado, por exemplo: 06h às 18h.',
    durationMinutes: 720,
  },
  {
    id: 'noturna-12h',
    name: 'Jornada Noturna — 12 horas',
    description:
      'Jornada fixa de 12 horas em período noturno. Informe o horário praticado, por exemplo: 18h às 06h.',
    durationMinutes: 720,
  },
  {
    id: '12h-revezamento',
    name: 'Jornada de 12 horas — Revezamento',
    description:
      'Jornada de 12 horas em regime de revezamento entre turmas e períodos. Exemplo: 06h às 18h e 18h às 06h. Ajuste os horários conforme a escala praticada pela empresa.',
    durationMinutes: 720,
  },
] as const;

export const COMPANY_SHIFT_DURATION_CHANGE_WARNING =
  'Esta jornada pode estar vinculada a trabalhadores. A nova duração será considerada nas análises e sugestões que utilizam a jornada de trabalho.';
