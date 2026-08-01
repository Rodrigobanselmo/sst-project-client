export function shouldResetPageOnSearch(_params: {
  previousPage?: number;
  nextSearch?: string | null;
}): boolean {
  // Any search change must return to page 1 so results are not hidden by pagination offset.
  return true;
}

export function characterizationSearchEmptyMessage(searchTerm: string): string {
  return `Nenhum elemento caracterizável encontrado para “${searchTerm}”.`;
}

export function characterizationSearchErrorMessage(): string {
  return 'Não foi possível carregar os elementos caracterizáveis. Tente novamente.';
}
