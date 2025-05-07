type PriorityTranslationMap = Record<number, string>;

export const TaskPriorityTranslation: PriorityTranslationMap = {
  [0]: 'Sem Prioridade',
  [1]: 'Urgente',
  [2]: 'Alta',
  [3]: 'Média',
  [4]: 'Baixa',
};
