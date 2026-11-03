import type { EventDeadlinePresentation } from './legal-deadline-model';

export const SECONDARY_EVENT_TYPES = [
  'S-2210',
  'S-2220',
  'S-2221',
  'S-3000',
] as const;
export type SecondaryEventType = (typeof SECONDARY_EVENT_TYPES)[number];
export type SecondarySourceOption = {
  id: string | number;
  label: string;
  employeeId?: number;
  employeeName?: string;
  date?: string;
  state?: string;
  receipt?: string | null;
  eventType?: string;
  lastAcceptedDeliveryId?: string;
  lastReceipt?: string;
  sourceHash?: string;
  changedSinceAccepted?: boolean;
  needsRectification?: boolean;
  needsExclusion?: boolean;
  diagnostics?: { code: string; message?: string }[];
  legalDeadline?: EventDeadlinePresentation;
};
export type SecondaryPreparation = {
  id: string;
  type: SecondaryEventType;
  environment: 1 | 2;
  state: string;
  sourceHash: string;
  legalDeadline?: EventDeadlinePresentation;
  createdAt?: string;
  diagnostics?: { code: string; message?: string; field?: string }[];
  warnings?: {
    code: string;
    message: string;
    field?: string;
    severity?: 'INFO';
  }[];
  unsignedXml?: string;
  content?: unknown;
  source?: { id: string | number; label: string };
  delivery?: {
    id?: string;
    state: string;
    receipt?: string | null;
    protocol?: string | null;
    errorCode?: string | null;
    excluded?: boolean;
    exclusionPending?: boolean;
  } | null;
};
export type SecondaryOverview = {
  sources: SecondarySourceOption[];
  events: SecondaryPreparation[];
  environments: { restricted: boolean; production: boolean };
  employerRegistration?: string;
  employerRegistrationOptions?: { value: string; label: string }[];
  employerRegistrationDefault?: string;
  totalSources?: number;
  sourcesTruncated?: boolean;
  acceptedDeliveries?: SecondarySourceOption[];
};

export const secondaryEventLabels: Record<SecondaryEventType, string> = {
  'S-2210': 'S-2210 — Comunicação de acidente de trabalho',
  'S-2220': 'S-2220 — Saúde do trabalhador / ASO',
  'S-2221': 'S-2221 — Exame toxicológico',
  'S-3000': 'S-3000 — Exclusão de evento aceito',
};
export const secondarySourceLabels: Record<SecondaryEventType, string> = {
  'S-2210': 'CAT cadastrada',
  'S-2220': 'ASO cadastrado',
  'S-2221': 'Exame toxicológico cadastrado',
  'S-3000': 'Evento aceito a excluir',
};

export function canConfirmSecondary(
  event: SecondaryPreparation,
  enabled: boolean,
): boolean {
  return Boolean(
    enabled &&
      event.state === 'READY' &&
      event.sourceHash &&
      !event.delivery &&
      !event.diagnostics?.length,
  );
}

export function secondaryPreparationLabel(event: SecondaryPreparation): string {
  const source = secondaryDisplayLabel(
    event.source?.label || 'Cadastro de origem',
  );
  const date = event.createdAt?.slice(0, 10).split('-').reverse().join('/');
  return `${source}${date ? ` — ${date}` : ''}`;
}

/** Format standalone civil dates in human labels, never IDs or API content. */
export function secondaryDisplayLabel(label: string): string {
  return label.replace(
    /(^|[\s·])(\d{4})-(\d{2})-(\d{2})(?=$|[\s·])/g,
    (original, prefix: string, year: string, month: string, day: string) => {
      const y = Number(year),
        m = Number(month),
        d = Number(day);
      const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
      const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      return m >= 1 && m <= 12 && d >= 1 && d <= days[m - 1]
        ? `${prefix}${day}/${month}/${year}`
        : original;
    },
  );
}

export function secondarySourceHasChanged(
  selected?: SecondarySourceOption | null,
  current?: SecondarySourceOption | null,
): boolean {
  return Boolean(
    selected &&
      current &&
      (selected.lastAcceptedDeliveryId !== current.lastAcceptedDeliveryId ||
        selected.lastReceipt !== current.lastReceipt ||
        selected.sourceHash !== current.sourceHash),
  );
}

export function canCancelSecondary(event: SecondaryPreparation): boolean {
  const delivery = event.delivery;
  if (!delivery) return ['READY', 'BLOCKED'].includes(event.state);
  return Boolean(
    delivery &&
      ['QUEUED', 'BLOCKED', 'REJECTED'].includes(delivery.state) &&
      (!delivery.protocol || delivery.state === 'REJECTED'),
  );
}

export function canRetrySecondary(
  event: SecondaryPreparation,
  enabled: boolean,
): boolean {
  return Boolean(
    enabled &&
      event.delivery?.state === 'BLOCKED' &&
      !event.delivery.protocol &&
      event.delivery.errorCode === 'PRE_SEND_BLOCKED',
  );
}

export function secondaryRequestKey(input: {
  type: SecondaryEventType;
  environment: 1 | 2;
  sourceId?: string | number;
  targetDeliveryId?: string;
  kind?: 'ORIGINAL' | 'RECTIFICATION';
  employerRegistration?: string;
  reason: string;
}): string {
  return JSON.stringify({ ...input, reason: input.reason.trim() });
}

export type SecondarySourceReview = SecondarySourceOption & {
  reviewId: string;
  sourceId: string;
  type: Exclude<SecondaryEventType, 'S-3000'>;
  environment: 1 | 2;
  state: string;
  lastCheckedAt?: string;
};
export type SecondaryReviewPage = {
  reviews: SecondarySourceReview[];
  nextCursor: string | null;
  cycles?: { id: string; cycleCompletedAt?: string | null }[];
};

/** A retried/polled page may overlap another. Keep the latest review, scoped
 * to this exact family and environment; never mix restricted/official rows. */
export function secondaryReviews(
  pages: SecondaryReviewPage[],
  type: SecondaryEventType,
  environment: 1 | 2,
): SecondarySourceReview[] {
  const rows = new Map<string, SecondarySourceReview>();
  for (const page of pages) {
    for (const row of page.reviews) {
      if (row.type !== type || row.environment !== environment) continue;
      const key = String(row.sourceId || row.id);
      const previous = rows.get(key);
      if (
        !previous ||
        (row.lastCheckedAt || '') >= (previous.lastCheckedAt || '')
      )
        rows.set(key, row);
    }
  }
  return Array.from(rows.values());
}

export function secondarySourceOptions(
  recent: SecondarySourceOption[],
  reviews: SecondarySourceOption[],
  selected?: SecondarySourceOption | null,
): SecondarySourceOption[] {
  const options = new Map<string, SecondarySourceOption>();
  // The real-time catalogue wins over an older reconciliation snapshot.
  for (const row of [...recent, ...reviews, ...(selected ? [selected] : [])])
    if (!options.has(String(row.id))) options.set(String(row.id), row);
  return Array.from(options.values());
}
export function secondaryReviewStateLabel(state?: string) {
  const labels: Record<string, string> = {
    INITIAL_PENDING: 'Ainda não declarado',
    RECTIFICATION_REQUIRED: 'Alterações para retificar',
    EXCLUSION_REQUIRED: 'Conferir exclusão do evento',
    SOURCE_MISSING: 'Cadastro de origem indisponível',
    BLOCKED: 'Informações para completar na origem',
    DELIVERY_IN_PROGRESS: 'Envio em processamento',
    REVIEW_FAILED: 'Conferência precisa de assistência',
    BEFORE_RESPONSIBILITY_START: 'Anterior à data inicial de envio',
  };
  return (state && labels[state]) || 'Conferir cadastro de origem';
}

export function secondarySourceHasNoChanges(
  source?: SecondarySourceOption | null,
): boolean {
  return Boolean(
    source?.lastAcceptedDeliveryId &&
      source.changedSinceAccepted === false &&
      !source.needsRectification &&
      !source.needsExclusion,
  );
}

/** Original declarations explicitly select the S1000 registration. Later
 * operations derive it from the selected acceptance and cannot replace it. */
export function secondaryPrepareRequest(input: {
  type: SecondaryEventType;
  environment: 1 | 2;
  kind: 'ORIGINAL' | 'RECTIFICATION';
  source: SecondarySourceOption | null;
  reason: string;
  employerRegistration?: string;
  allowedRegistrations: string[];
}) {
  if (!input.source || !input.reason.trim())
    throw new Error('Selecione o cadastro de origem e informe o motivo.');
  const common = {
    environment: input.environment,
    reason: input.reason.trim(),
  };
  if (input.type === 'S-3000')
    return { ...common, targetDeliveryId: String(input.source.id) };
  if (input.kind === 'RECTIFICATION') {
    if (!input.source.lastAcceptedDeliveryId)
      throw new Error(
        'Selecione o último evento aceito desta origem para retificar.',
      );
    return {
      ...common,
      sourceId: String(input.source.id),
      kind: input.kind,
      targetDeliveryId: input.source.lastAcceptedDeliveryId,
    };
  }
  if (input.source.lastAcceptedDeliveryId)
    throw new Error(
      'Esta origem já foi aceita. Confira a retificação do evento anterior.',
    );
  const employerRegistration = input.employerRegistration?.trim().toUpperCase();
  if (
    !employerRegistration ||
    !input.allowedRegistrations.includes(employerRegistration)
  )
    throw new Error(
      'Escolha a inscrição do empregador que está cadastrada no eSocial.',
    );
  return {
    ...common,
    sourceId: String(input.source.id),
    kind: input.kind,
    employerRegistration,
  };
}
