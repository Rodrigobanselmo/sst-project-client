import type { IErrorResp } from '@v2/types/error.type';
import { extractApiError } from '@v2/utils/extract-api-error';

export type FrpsExplainabilityErrorKind =
  | 'not_found'
  | 'forbidden'
  | 'conflict'
  | 'conceptual_failed'
  | 'contextual_failed'
  | 'invalid_response'
  | 'content_validation'
  | 'model_unavailable'
  | 'ai_failure'
  | 'unexpected';

const CODE_MESSAGES: Record<string, { kind: FrpsExplainabilityErrorKind; message: string }> = {
  CONCEPTUAL_GENERATION_FAILED: {
    kind: 'conceptual_failed',
    message:
      'Não foi possível concluir a geração da explicação conceitual neste momento. Tente novamente.',
  },
  CONTEXTUAL_GENERATION_FAILED: {
    kind: 'contextual_failed',
    message:
      'Não foi possível concluir a geração da justificativa contextual neste momento. Tente novamente.',
  },
  MODEL_TEMPORARILY_UNAVAILABLE: {
    kind: 'model_unavailable',
    message: 'O modelo de IA está temporariamente indisponível. Tente novamente.',
  },
  INVALID_MODEL_RESPONSE: {
    kind: 'invalid_response',
    message:
      'A resposta gerada não atendeu ao formato técnico esperado. Tente novamente.',
  },
  CONTENT_VALIDATION_FAILED: {
    kind: 'content_validation',
    message:
      'A resposta gerada não atendeu às regras metodológicas esperadas. Tente novamente.',
  },
  ITEM_NOT_FOUND: {
    kind: 'not_found',
    message:
      'O item não foi encontrado nesta análise. Atualize a tela e tente novamente.',
  },
  CONTENT_REJECTED: {
    kind: 'conflict',
    message:
      'Este conteúdo precisa de revisão antes de poder ser gerado novamente.',
  },
  CONCEPTUAL_NOT_VALIDATED: {
    kind: 'forbidden',
    message:
      'A explicação conceitual precisa estar validada por um usuário master antes da justificativa desta análise.',
  },
  GLOBAL_CATALOG_LINK_REQUIRED: {
    kind: 'conflict',
    message:
      'Este item ainda não possui identidade global na Biblioteca. A explicação técnica ficará disponível quando o item for criado no catálogo do sistema.',
  },
  FORBIDDEN_MODEL: {
    kind: 'forbidden',
    message: 'Você não tem permissão para selecionar este modelo de IA.',
  },
  UNEXPECTED_ERROR: {
    kind: 'unexpected',
    message:
      'Ocorreu um erro inesperado ao carregar a explicação técnica. Tente novamente.',
  },
};

export function classifyFrpsExplainabilityError(error: unknown): {
  kind: FrpsExplainabilityErrorKind;
  message: string;
  code?: string;
} {
  const status =
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as IErrorResp).response?.status === 'number'
      ? (error as IErrorResp).response?.status
      : undefined;

  const data =
    typeof error === 'object' &&
    error !== null &&
    'response' in error
      ? (error as IErrorResp).response?.data
      : undefined;

  const code =
    data && typeof data === 'object' && typeof data.code === 'string'
      ? data.code
      : undefined;

  if (code && CODE_MESSAGES[code]) {
    return { ...CODE_MESSAGES[code], code };
  }

  const apiMessage =
    typeof error === 'object' && error !== null && 'response' in error
      ? extractApiError(error as IErrorResp)
      : undefined;

  const rawMessage =
    apiMessage ||
    (error instanceof Error ? error.message : undefined) ||
    'Não foi possível carregar a explicação técnica.';

  // 404 de rota ausente (API sem restart) ≠ item inexistente na análise.
  if (/Cannot GET|Cannot POST/i.test(rawMessage || '')) {
    return {
      kind: 'unexpected',
      message:
        'A API de explicabilidade está desatualizada ou indisponível. Reinicie a API e tente novamente.',
    };
  }

  if (
    code === 'ITEM_NOT_FOUND' ||
    (/não encontrad/i.test(rawMessage) &&
      !/Aplicação de formulário|Formulário aplicado/i.test(rawMessage))
  ) {
    return {
      kind: 'not_found',
      message:
        'O item não foi encontrado nesta análise. Atualize a tela e tente novamente.',
    };
  }

  if (status === 404) {
    return {
      kind: 'unexpected',
      message:
        'Não foi possível carregar a explicação técnica. Atualize a tela e tente novamente.',
    };
  }

  if (status === 403 || /permiss/i.test(rawMessage)) {
    return {
      kind: 'forbidden',
      message: 'Você não tem permissão para visualizar esta explicação.',
    };
  }

  if (
    status === 409 ||
    /REJECTED|conflito|não pode ser reutilizad|VALIDATED/i.test(rawMessage)
  ) {
    return {
      kind: 'conflict',
      message:
        'Este conteúdo precisa de revisão antes de poder ser gerado novamente.',
    };
  }

  if (/formato técnico|invalid.*json|INVALID_MODEL/i.test(rawMessage)) {
    return {
      kind: 'invalid_response',
      message:
        'A resposta gerada não atendeu ao formato técnico esperado. Tente novamente.',
    };
  }

  if (status === 400 || /Falha ao gerar|IA|modelo|prompt/i.test(rawMessage)) {
    return {
      kind: 'ai_failure',
      message: 'Não foi possível concluir a geração neste momento. Tente novamente.',
    };
  }

  return {
    kind: 'unexpected',
    message:
      'Ocorreu um erro inesperado ao carregar a explicação técnica. Tente novamente.',
  };
}
