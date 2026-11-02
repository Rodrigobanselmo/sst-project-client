export type SendingPolicyOverview = {
  policy: { fromDate: string; revision: number } | null;
  reviewRequired: boolean;
  deliverySummary: {
    accepted: number;
    acceptedEmployments: number;
    inFlight: number;
  };
};

export type PolicyDraft = {
  fromDate: string;
  reason: string;
  expectedRevision: number;
};

export type PolicyPreview = {
  previewHash: string;
  expectedRevision: number;
  fromDate: string;
  previousFromDate: string | null;
  direction: 'EXPAND' | 'REDUCE' | 'UNCHANGED' | 'INITIAL';
  acceptedDeclarations: number;
  acceptedEmployments: number;
};

export function policyDraftKey(draft: PolicyDraft): string {
  return JSON.stringify([
    draft.fromDate,
    draft.reason.trim(),
    draft.expectedRevision,
  ]);
}

export function policyPreviewMatches(
  preview: { draftKey: string; data: PolicyPreview } | undefined,
  draft: PolicyDraft,
): boolean {
  return Boolean(
    preview &&
      preview.draftKey === policyDraftKey(draft) &&
      preview.data.expectedRevision === draft.expectedRevision &&
      preview.data.fromDate.slice(0, 10) === draft.fromDate,
  );
}

export function policyImpactMessage(direction: PolicyPreview['direction']) {
  switch (direction) {
    case 'EXPAND':
      return 'A data foi antecipada. Os períodos anteriores ficam disponíveis somente quando você selecionar explicitamente o histórico na preparação; não serão enviados automaticamente.';
    case 'REDUCE':
      return 'A data foi adiada. As correções de períodos já aceitos e as condições posteriores ao primeiro aceite continuam sendo analisadas; a nova data não apaga essas obrigações.';
    case 'UNCHANGED':
      return 'A data permanece igual. A confirmação não cria outra revisão da configuração.';
    case 'INITIAL':
      return 'Esta será a data inicial usada para preparar as condições cadastradas neste sistema.';
  }
}

export function policyReviewError(code?: string): string | undefined {
  switch (code) {
    case 'POLICY_PREVIEW_STALE':
      return 'Os dados mudaram desde a análise. Consulte o impacto novamente; a data e o motivo que você digitou foram mantidos.';
    case 'POLICY_REVISION_CONFLICT':
      return 'A data inicial foi alterada por outra pessoa. Confira a data configurada e consulte o impacto novamente. Seu rascunho foi mantido.';
    case 'POLICY_REVIEW_REQUIRED':
      return 'Já há um envio registrado. Consulte o impacto antes de confirmar esta alteração. Seu rascunho foi mantido.';
    case 'INITIAL_POLICY_IN_FLIGHT':
      return 'Conclua os envios pendentes antes de alterar a data inicial. Retome ou cancele as tentativas bloqueadas no painel abaixo; resultados incertos precisam ser reconciliados.';
  }
}
