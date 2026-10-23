const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const bulkEditErrorMessage = (error: unknown): string => {
  if (isRecord(error)) {
    const response = error.response;
    if (isRecord(response) && isRecord(response.data)) {
      const message = response.data.message;
      if (typeof message === 'string' && message.trim()) return message;
    }
    if (typeof error.message === 'string' && error.message.trim())
      return error.message;
  }
  return 'Não foi possível atualizar os vínculos.';
};
