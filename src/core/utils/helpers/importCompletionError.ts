const code = 'IMPORT_RECALCULATION_PENDING';
const fallback =
  'A importação já foi aplicada, mas o recálculo dos exames está pendente. Não importe o arquivo novamente. Solicite o reprocessamento dos exames dos empregados.';

/** Import data is committed. Retrying the file is not a recovery operation. */
export class ImportRecalculationPendingError extends Error {
  readonly name = 'ImportRecalculationPendingError';
  readonly code = code;
  readonly dataCommitted = true;
  readonly retryImport = false;
  readonly response: any;
  readonly originalError: unknown;

  constructor(message: string, originalError: unknown) {
    super(message);
    this.originalError = originalError;
    this.response = (originalError as any)?.response;
  }
}

/** Decode only this exact error; leave ordinary HTTP and binary errors intact. */
export async function readImportRecalculationPendingError(
  error: unknown,
): Promise<ImportRecalculationPendingError | undefined> {
  if (error instanceof ImportRecalculationPendingError) return error;
  const response = (error as any)?.response;
  if (response?.status !== 409) return;
  let body = response.data;
  try {
    if (typeof Blob !== 'undefined' && body instanceof Blob) {
      if (body.size > 256 * 1024) return;
      body = await body.text();
    }
    if (typeof body === 'string') body = JSON.parse(body);
  } catch {
    return;
  }
  if (
    !body ||
    body.code !== code ||
    body.dataCommitted !== true ||
    body.retryImport !== false
  )
    return;
  return new ImportRecalculationPendingError(
    typeof body.message === 'string' && body.message.trim()
      ? body.message
      : fallback,
    error,
  );
}
