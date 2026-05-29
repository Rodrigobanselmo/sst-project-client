/**
 * Normaliza termo de busca de participantes.
 * Quando o input parece CPF/telefone (predominantemente dígitos), envia só dígitos à API.
 * Nomes e e-mails permanecem como digitados.
 */
export function normalizeParticipantSearchTerm(search: string): string {
  const trimmed = search.trim();
  if (!trimmed) return trimmed;

  const digitsOnly = trimmed.replace(/\D/g, '');
  const withoutSpaces = trimmed.replace(/\s/g, '');
  if (
    digitsOnly.length >= 3 &&
    withoutSpaces.length > 0 &&
    digitsOnly.length / withoutSpaces.length >= 0.5
  ) {
    return digitsOnly.length > 0 ? digitsOnly : trimmed;
  }

  return trimmed;
}
