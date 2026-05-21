/**
 * Tipo de link (campo `isShareableLink` / shareableLink na criação):
 * - `true`  → Link único compartilhável → sem reforço por e-mail
 * - `false` → Link por funcionário → elegível para reforço
 */
export const isFormReminderEligible = ({
  isAcceptingResponses,
  isShareableLink,
}: {
  isAcceptingResponses: boolean;
  isShareableLink: boolean;
}) => isAcceptingResponses && isShareableLink === false;
