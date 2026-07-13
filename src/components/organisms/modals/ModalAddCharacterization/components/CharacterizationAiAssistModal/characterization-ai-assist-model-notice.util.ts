const STORAGE_PREFIX = 'characterization-ai-assist-default-model-notice';

export type CharacterizationAiAssistModelNoticeScope = {
  companyId: string;
  workspaceId: string;
  characterizationId: string;
};

export const buildCharacterizationAiAssistModelNoticeStorageKey = ({
  companyId,
  workspaceId,
  characterizationId,
}: CharacterizationAiAssistModelNoticeScope): string =>
  `${STORAGE_PREFIX}:${companyId}:${workspaceId}:${characterizationId}`;

export const hasAcknowledgedCharacterizationAiAssistDefaultModel = (
  scope: CharacterizationAiAssistModelNoticeScope,
): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return (
      sessionStorage.getItem(
        buildCharacterizationAiAssistModelNoticeStorageKey(scope),
      ) === '1'
    );
  } catch {
    return false;
  }
};

export const acknowledgeCharacterizationAiAssistDefaultModel = (
  scope: CharacterizationAiAssistModelNoticeScope,
): void => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      buildCharacterizationAiAssistModelNoticeStorageKey(scope),
      '1',
    );
  } catch {
    // sessionStorage pode estar indisponível; o fluxo segue sem persistir.
  }
};
