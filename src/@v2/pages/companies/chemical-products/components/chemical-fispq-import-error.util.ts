const FISPQ_NO_TEXT =
  'Não foi possível extrair texto deste PDF. Continue pelo cadastro manual.';

function readPayload(error: any): Record<string, any> {
  const data = error?.response?.data;
  return data && typeof data === 'object' ? data : {};
}

function readMessage(error: any): string {
  const data = readPayload(error);
  const raw = data.message;
  if (Array.isArray(raw)) return raw.filter(Boolean).join('\n');
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message.trim();
  }
  return '';
}

/**
 * Maps FISPQ import HTTP errors to specific user-facing copy (no stack traces).
 */
export function mapChemicalFispqImportError(error: unknown): string {
  const err = error as any;
  const status = err?.response?.status as number | undefined;
  const data = readPayload(err);
  const message = readMessage(err);
  const code = String(data.code || '');
  const errorId = data.errorId ? ` [ref: ${data.errorId}]` : '';
  const detail = `${message} ${JSON.stringify(data)}`.toLowerCase();

  if (status === 401 || status === 403) {
    return `Sessão expirada ou sem permissão para importar FISPQ.${errorId}`;
  }

  if (
    code === 'FISPQ_INVALID_FORMAT' ||
    /formato inválido|\.pdf|file type/i.test(detail)
  ) {
    return `Formato inválido. Envie um arquivo PDF (.pdf).${errorId}`;
  }

  if (
    code === 'FISPQ_FILE_TOO_LARGE' ||
    /tamanho máximo|too large|maxfilesize/i.test(detail)
  ) {
    return `Arquivo excede o tamanho máximo permitido.${errorId}`;
  }

  if (
    code === 'FISPQ_UPLOAD_FAILED' ||
    /armazenamento|upload|enviar o arquivo/i.test(detail)
  ) {
    return `Falha ao enviar o arquivo da FISPQ para o armazenamento. Tente novamente.${errorId}`;
  }

  if (code === 'FISPQ_PDF_READ_FAILED' || /não foi possível ler este pdf/i.test(detail)) {
    return `${message || 'Não foi possível ler este PDF.'}${errorId}`;
  }

  if (
    code === 'FISPQ_NO_TEXT' ||
    message.includes(FISPQ_NO_TEXT) ||
    /continue pelo cadastro manual/i.test(detail)
  ) {
    return FISPQ_NO_TEXT;
  }

  if (status === 400 && message) {
    return `${message}${errorId}`;
  }

  if (status && status >= 500) {
    return `Erro inesperado ao processar a FISPQ. Informe o suporte com o identificador.${errorId || ' [ref: desconhecido]'}`;
  }

  return (
    message ||
    `Erro inesperado ao importar a FISPQ. Tente novamente ou use o cadastro manual.${errorId}`
  );
}
