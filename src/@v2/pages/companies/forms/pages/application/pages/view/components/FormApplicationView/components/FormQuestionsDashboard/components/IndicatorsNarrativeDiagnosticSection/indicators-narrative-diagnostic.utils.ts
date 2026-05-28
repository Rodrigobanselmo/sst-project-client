export function getIndicatorsNarrativeDiagnosticErrorMessage(
  metadata?: Record<string, unknown> | null,
  isMaster = false,
): string {
  if (!isMaster) {
    return 'Não foi possível concluir a análise com IA neste momento. Entre em contato com o suporte técnico.';
  }

  const raw = metadata?.error;
  const detail = typeof raw === 'string' ? raw.toLowerCase() : '';

  if (
    /429|rate limit|tokens per min|tpm|rpm|too many requests|please try again in/i.test(
      detail,
    )
  ) {
    return 'Limite temporário de uso da IA atingido. Aguarde alguns minutos e tente novamente.';
  }

  if (
    /exceeded your current quota|billing|plan|insufficient quota|credit balance|payment required/i.test(
      detail,
    )
  ) {
    return 'Cota ou faturamento da API de IA indisponível. Verifique chave, créditos ou billing da OpenAI.';
  }

  if (
    /model[_\s-]?not[_\s-]?found|does not exist|no access to model|not available for this model|unsupported model/i.test(
      detail,
    )
  ) {
    return 'Modelo de IA indisponível para esta chave/projeto.';
  }

  return 'Não foi possível gerar o diagnóstico narrativo. Você pode tentar novamente.';
}
