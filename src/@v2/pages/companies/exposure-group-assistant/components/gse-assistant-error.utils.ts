const MASTER_ONLY_MESSAGE =
  'Apenas MASTER pode executar esta ação do Assistente de GSE nesta versão.';

const GENERIC_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.';

const NETWORK_MESSAGE =
  'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';

type AxiosLikeError = {
  message?: string;
  code?: string;
  response?: {
    status?: number;
    data?: {
      message?: string | string[];
    };
  };
};

const isAxiosLikeError = (err: unknown): err is AxiosLikeError =>
  typeof err === 'object' && err != null && ('response' in err || 'message' in err);

function looksTechnical(message: string): boolean {
  return /failed to analyze|connection error|econnrefused|etimedout|stack|exception|prisma|sql|openai|status code|network error/i.test(
    message,
  );
}

export function resolveGseAssistantErrorMessage(err: unknown): string {
  if (!isAxiosLikeError(err)) {
    if (err instanceof Error && err.message && !looksTechnical(err.message)) {
      return err.message;
    }
    return GENERIC_MESSAGE;
  }

  const status = err.response?.status;
  if (status === 401 || status === 403) {
    return MASTER_ONLY_MESSAGE;
  }
  if (status === 409) {
    const apiMessage = err.response?.data?.message;
    const normalized = Array.isArray(apiMessage)
      ? apiMessage.join(' ')
      : typeof apiMessage === 'string'
        ? apiMessage
        : undefined;
    if (normalized && !looksTechnical(normalized)) return normalized;
    return 'A proposta mudou desde a análise. Atualize a lista e revise novamente antes de criar.';
  }

  if (!err.response && (err.code === 'ERR_NETWORK' || /network/i.test(err.message ?? ''))) {
    return NETWORK_MESSAGE;
  }

  const apiMessage = err.response?.data?.message;
  const normalized = Array.isArray(apiMessage)
    ? apiMessage.join(' ')
    : typeof apiMessage === 'string'
      ? apiMessage
      : undefined;

  if (normalized && !looksTechnical(normalized)) {
    return normalized;
  }

  return GENERIC_MESSAGE;
}

export function resolveGseRefineUserMessage(fallbackReason?: string | null): string {
  if (!fallbackReason?.trim()) {
    return 'A IA não pôde aprimorar a redação neste momento. Os textos originais foram mantidos.';
  }
  if (looksTechnical(fallbackReason)) {
    return 'Não foi possível aprimorar a redação com IA neste momento. Os textos originais foram mantidos.';
  }
  return fallbackReason.trim();
}
