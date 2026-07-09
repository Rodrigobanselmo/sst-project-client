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
