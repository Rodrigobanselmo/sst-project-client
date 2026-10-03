/**
 * Helper genérico para sugestões client-side de texto em campos da Company.
 * Não persiste nada — só decide se o preset pode ir ao formulário.
 */

export function isTextPresetFieldEmpty(value?: string | null): boolean {
  return !String(value ?? '').trim();
}

/**
 * Resolve aplicação de um preset de campo único:
 * - vazio → devolve o texto sugerido;
 * - com conteúdo e sem confirmação → 'needs-confirmation';
 * - com confirmação → devolve o texto sugerido.
 */
export function resolveSingleFieldPresetApplication(params: {
  current?: string | null;
  preset: string;
  confirmedOverwrite: boolean;
}): string | 'needs-confirmation' {
  if (isTextPresetFieldEmpty(params.current)) {
    return params.preset;
  }

  if (!params.confirmedOverwrite) {
    return 'needs-confirmation';
  }

  return params.preset;
}
