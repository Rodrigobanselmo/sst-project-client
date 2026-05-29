/**
 * Garante que o termo de busca da URL seja string (queryParamsToObject pode
 * converter CPF numérico para number e quebrar .trim()).
 */
export function coerceParticipantSearchQuery(search: unknown): string {
  if (search == null || search === '') {
    return '';
  }
  return String(search).trim();
}
