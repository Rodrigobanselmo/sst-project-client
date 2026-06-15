import { IErrorResp } from '@v2/types/error.type';
import { extractApiError } from '@v2/utils/extract-api-error';

const GENERIC_ERROR_MESSAGE =
  'Algo de errado aconteceu, informe o suporte para mais detalhes.';

export const getSystemAiPromptErrorMessage = (
  error: IErrorResp | string | unknown,
): string => {
  if (typeof error === 'string') return error;
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return GENERIC_ERROR_MESSAGE;
  }

  const apiError = error as IErrorResp;
  const status = apiError.response?.status;
  const message = extractApiError(apiError) ?? '';
  const payload = JSON.stringify(apiError.response?.data ?? '').toLowerCase();
  const detail = `${message} ${payload}`.toLowerCase();

  if (status === 403 || detail.includes('master') || detail.includes('permissão')) {
    return 'Usuário sem permissão para configurar prompt/modelo.';
  }

  if (
    status === 503 ||
    /invalid input value for enum|systemaipromptkeyenum|enum.*not.*applied|migration/i.test(
      detail,
    )
  ) {
    return 'Configuração de IA ainda não disponível. Aplique as migrations e reinicie a API.';
  }

  if (status === 400 && /chave de prompt inválida|chave.*não registrada/i.test(detail)) {
    return 'Chave de prompt da IA não registrada para esta ferramenta.';
  }

  if (
    status === 400 &&
    (/conteúdo do prompt|payload|validation|conteúdo/i.test(detail) ||
      detail.includes('content'))
  ) {
    return 'Não foi possível salvar a configuração do prompt/modelo.';
  }

  if (message && message !== GENERIC_ERROR_MESSAGE) {
    return message;
  }

  return GENERIC_ERROR_MESSAGE;
};
