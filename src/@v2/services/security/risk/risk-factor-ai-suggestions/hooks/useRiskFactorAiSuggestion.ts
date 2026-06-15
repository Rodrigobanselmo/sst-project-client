import { useCallback, useState } from 'react';

import { requestRiskFactorAiSuggestions } from '../service/risk-factor-ai-suggestions.service';
import type {
  RiskFactorAiSuggestionPayload,
  RiskFactorAiSuggestionResult,
} from '../service/risk-factor-ai-suggestions.types';

type AxiosLikeError = {
  response?: {
    status?: number;
    data?: {
      message?: string | string[];
    };
  };
};

const isAxiosLikeError = (err: unknown): err is AxiosLikeError =>
  typeof err === 'object' &&
  err != null &&
  'response' in err;

export function resolveRiskFactorAiSuggestionError(err: unknown): string {
  if (!isAxiosLikeError(err)) {
    return 'Erro ao gerar sugestão com IA.';
  }

  const status = err.response?.status;
  const apiMessage = err.response?.data?.message;
  const normalizedApiMessage = Array.isArray(apiMessage)
    ? apiMessage.join(' ')
    : typeof apiMessage === 'string'
      ? apiMessage
      : undefined;

  if (status === 503) {
    return 'Serviço de IA não configurado neste ambiente.';
  }

  if (status === 401 || status === 403) {
    return 'Usuário sem permissão para gerar sugestão.';
  }

  if (status === 500) {
    return 'Erro ao gerar sugestão com IA.';
  }

  if (status === 400) {
    return normalizedApiMessage || 'Dados insuficientes ou inválidos para gerar sugestão.';
  }

  if (status === 404) {
    return 'Serviço de sugestão por IA indisponível neste ambiente.';
  }

  return normalizedApiMessage || 'Erro ao gerar sugestão com IA.';
}

export function useRiskFactorAiSuggestion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<RiskFactorAiSuggestionResult | null>(
    null,
  );

  const generate = useCallback(async (payload: RiskFactorAiSuggestionPayload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await requestRiskFactorAiSuggestions(payload);
      setLastResult(result);
      return result;
    } catch (err: unknown) {
      const normalized = resolveRiskFactorAiSuggestionError(err);
      setError(normalized);
      throw new Error(normalized);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLastResult(null);
  }, []);

  return {
    generate,
    loading,
    error,
    lastResult,
    reset,
  };
}
