type CharacterizationTextFields = {
  paragraphs?: string[];
  activities?: string[];
  considerations?: string[];
};

const stripTypeSuffix = (value: string): string => {
  const marker = '{type}=';
  const index = value.lastIndexOf(marker);
  return index >= 0 ? value.slice(0, index).trim() : value.trim();
};

const joinFieldText = (items?: string[]): string =>
  (items ?? []).map(stripTypeSuffix).filter(Boolean).join(' ');

export const isCharacterizationTextInsufficient = (
  data: CharacterizationTextFields,
): boolean => {
  const descriptionText = joinFieldText(data.paragraphs);
  const activitiesText = joinFieldText(data.activities);
  const considerationsText = joinFieldText(data.considerations);
  const totalLength =
    descriptionText.length + activitiesText.length + considerationsText.length;

  if (totalLength < 80) return true;

  return descriptionText.length < 40 && activitiesText.length < 40;
};

export const CHARACTERIZATION_TEXT_INSUFFICIENT_MESSAGE =
  'A caracterização textual está vazia ou insuficiente. Recomenda-se usar o Assistente IA da Caracterização na aba Dados antes de executar a Análise IA de riscos.';

export const CHARACTERIZATION_AI_ANALYSIS_USES_SAVED_DATA_MESSAGE =
  'A Análise IA usa os dados salvos da caracterização. Se você aplicou sugestões do Assistente IA, salve a caracterização antes de analisar os riscos.';

export const CHARACTERIZATION_UNSAVED_CHANGES_BEFORE_AI_ANALYSIS_MESSAGE =
  'Há alterações não salvas nesta caracterização. Salve na aba Dados antes de analisar os riscos, pois a Análise IA usa apenas os dados persistidos no sistema.';
