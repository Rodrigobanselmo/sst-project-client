import type { AiSuggestionIntent } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

/** Frase de orientação. Não é o nome da medida e não pode ir para o cadastro. */
const VERIFICATION_INSTRUCTION = /^verificar se\b/i;

export type SuggestionApplyPlan =
  | { action: 'append'; value: string | number }
  | { action: 'needs-confirmation'; value: string }
  | { action: 'reject' };

export function planSuggestionApply(params: {
  intent?: string | null;
  value: string | number;
  confirmedExistence?: boolean;
}): SuggestionApplyPlan {
  if (typeof params.value === 'number') {
    return { action: 'append', value: params.value };
  }

  const text = params.value.trim().replace(/\s+/g, ' ');
  if (!text || VERIFICATION_INSTRUCTION.test(text)) return { action: 'reject' };
  if (params.intent === 'verificar' && !params.confirmedExistence) {
    return { action: 'needs-confirmation', value: text };
  }
  return { action: 'append', value: text };
}

export async function resolveSuggestionApplyValue(params: {
  intent?: string | null;
  value: string | number;
  confirmExistence: (measure: string) => Promise<boolean>;
}): Promise<string | number | null> {
  const plan = planSuggestionApply(params);
  if (plan.action === 'reject') return null;
  if (plan.action === 'needs-confirmation') {
    const confirmed = await params.confirmExistence(plan.value);
    if (!confirmed) return null;
    return plan.value;
  }
  return plan.value;
}

export function existenceConfirmationCopy(measure: string) {
  return {
    title: 'Confirmar que o controle existe?',
    message: `“${measure}” será cadastrada como controle existente porque você confirma que ela está implantada. A orientação de verificação não entra no cadastro.`,
    confirmText: 'Confirmar que existe',
    cancelText: 'Cancelar',
    variant: 'warning' as const,
  };
}

export function suggestionApplyLabel(
  intent?: AiSuggestionIntent | null,
  applied = false,
): string {
  if (applied) return 'Aplicado';
  if (intent === 'verificar') return 'Confirmar que existe';
  if (intent === 'implementar') return 'Adicionar recomendação';
  if (intent === 'identificado') return 'Adicionar';
  return 'Aplicar';
}

export function suggestionIntentLabel(intent?: AiSuggestionIntent | null): string | null {
  if (intent === 'verificar') return 'Verificar existência';
  if (intent === 'implementar') return 'Implementar';
  if (intent === 'identificado') return 'Identificado no contexto';
  return null;
}
