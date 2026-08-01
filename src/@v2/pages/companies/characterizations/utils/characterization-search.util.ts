export type CharacterizationSearchUiState =
  | 'idle'
  | 'loading'
  | 'updating'
  | 'empty'
  | 'error'
  | 'success';

export type CharacterizationSearchUiInput = {
  hasWorkspaceSelected: boolean;
  searchTerm: string;
  resultCount: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  hasData: boolean;
};

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

/**
 * Exclusive UI state for characterization browse search.
 * Error and empty must never appear together; updating must not stick after settle/error.
 */
export function resolveCharacterizationSearchUiState(
  input: CharacterizationSearchUiInput,
): CharacterizationSearchUiState {
  if (!input.hasWorkspaceSelected) return 'idle';

  if (input.isError) return 'error';

  const initialLoading = input.isLoading && !input.hasData;
  if (initialLoading) return 'loading';

  if (input.isFetching) return 'updating';

  const trimmed = input.searchTerm.trim();
  if (trimmed && input.resultCount === 0) return 'empty';

  return 'success';
}

/**
 * Latest request wins: ignore stale responses whose requestId is older.
 */
export function shouldApplyCharacterizationSearchResponse(params: {
  activeRequestId: number;
  responseRequestId: number;
}): boolean {
  return params.responseRequestId === params.activeRequestId;
}
