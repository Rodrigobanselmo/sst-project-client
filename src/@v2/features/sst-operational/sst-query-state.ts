/** Poll healthy queries; a failed request waits for an explicit retry. */
export const sstRefetchInterval =
  (milliseconds: number) =>
  (_data: unknown, query: { state: { error: unknown } }): number | false =>
    query.state.error ? false : milliseconds;

/** React Query clears error during a retry. Keep the last failure visible. */
export function hasSstQueryError(query: {
  isError: boolean;
  isFetching: boolean;
  errorUpdatedAt: number;
  dataUpdatedAt: number;
}) {
  return (
    query.isError ||
    (query.isFetching && query.errorUpdatedAt > query.dataUpdatedAt)
  );
}

/** A tenant-scope denial applies to the entire company's operational page. */
export function sstScopeAccessMessage(error: unknown): string | null {
  const response = (
    error as {
      response?: { status?: number; data?: { message?: unknown } };
    } | null
  )?.response;
  if (response?.status !== 403) return null;
  const message = response.data?.message;
  if (message === 'Sem contrato direto ativo com a empresa solicitada.')
    return 'A organização da sua sessão não possui contrato direto ativo com esta empresa. O acompanhamento eSocial exige esse vínculo, inclusive para consulta.';
  if (
    message === 'Acesso à organização indisponível nesta sessão.' ||
    message === 'Empresa atendida indisponível nesta sessão.'
  )
    return 'O acesso a esta empresa está indisponível nesta sessão. Confira a organização selecionada e a situação da empresa.';
  return null;
}
