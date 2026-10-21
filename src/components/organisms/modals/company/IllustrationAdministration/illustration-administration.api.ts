import type { AxiosInstance } from 'axios';
export type LimitPeriod = 'DAY' | 'WEEK' | 'MONTH';
export const periodLabels: Record<LimitPeriod, string> = {
  DAY: 'Dia',
  WEEK: 'Semana',
  MONTH: 'Mês',
};
export const generationStatuses = [
  'GENERATING',
  'READY',
  'APPROVING',
  'APPROVED',
  'DISCARDED',
  'EXPIRED',
  'FAILED',
  'UNKNOWN',
] as const;
export const statusLabels: Record<string, string> = {
  GENERATING: 'Gerando',
  READY: 'Prévia disponível',
  APPROVING: 'Aprovando',
  APPROVED: 'Aprovada',
  DISCARDED: 'Descartada',
  EXPIRED: 'Expirada',
  FAILED: 'Falhou',
  UNKNOWN: 'Resultado incerto',
};
export type Settings = {
  platformMasterAccountingAvailable?: boolean;
  enabled: boolean;
  generationLimit: number;
  generationPeriod: LimitPeriod;
  budgetUsd: string;
  budgetPeriod: LimitPeriod;
  version: number;
  configured: boolean;
  updatedAt?: string;
  updatedById?: number;
};
export type SettingsInput = Pick<
  Settings,
  | 'enabled'
  | 'generationLimit'
  | 'generationPeriod'
  | 'budgetUsd'
  | 'budgetPeriod'
> & { expectedVersion: number };
export type Usage = {
  attemptsUsed: number;
  attemptsRemaining: number;
  confirmedCalculatedCostUsd: string;
  pendingReservationsUsd: string;
  priorPeriodReservationsUsd: string;
  committedUsd: string;
  availableUsd: string;
  accountingTimezone: string;
  quantityPeriodStart: string;
  financialPeriodStart: string;
  settings: Settings;
  costBasis: string;
};
export type HistoryFilter = {
  skip: number;
  take: number;
  from?: string;
  to?: string;
  status?: string;
  requestedById?: number;
  workspaceId?: string;
};
export type GenerationHistory = {
  id: string;
  reservedUsd?: string;
  billingMode?: 'COMPANY' | 'PLATFORM_MASTER';
  billingCompanyId?: string;
  targetCompany?: { id: string; name: string | null };
  characterization?: { id: string; name: string } | null;
  createdAt: string;
  status: string;
  requestedById: number;
  requestedBy?: { name?: string };
  model: string;
  workspaceId: string;
  characterizationId?: string;
  companyCharacterizationId?: string;
  confirmedCalculatedCostUsd: string | null;
  pendingReservationUsd: string;
  settingsVersion: number | null;
  providerRequestId?: string;
  discardedAt?: string;
  discardedById?: number;
  illustration?: {
    approvedAt: string;
    approvedById: number;
    approvedBy?: { name?: string };
    deletedAt?: string;
    deletedById?: number;
  } | null;
};
export type PlatformMasterUsage = {
  billingMode: 'PLATFORM_MASTER';
  billingCompanyId: string;
  commercialLimitsApply: false;
  attempts: number;
  unknownAttempts: number;
  confirmedCalculatedCostUsd: string;
  pendingReservationsUsd: string;
  costBasis: string;
};
export type SettingsAudit = {
  id: string;
  createdAt: string;
  changedById: number;
  changedBy?: { name?: string };
  before: Settings | null;
  after: Settings;
  version: number;
  requestId: string;
};
export type Page<T> = { count: number; data: T[] };
export class AdministrationError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function administrationError(error: unknown) {
  if (error instanceof AdministrationError) return error;
  const response = (
    error as {
      response?: { status: number; data?: { message?: string | string[] } };
    }
  )?.response;
  const status = response?.status ?? 0;
  const detail = response?.data?.message;
  const fallback: Record<number, string> = {
    401: 'Sessão expirada. Entre novamente.',
    403: 'Acesso negado. É necessário ser MASTER ativo e autorizado.',
    404: 'Empresa ou recurso não encontrado.',
    409: 'Outra pessoa alterou esta configuração. Atualize os dados antes de salvar novamente.',
  };
  return new AdministrationError(
    status,
    Array.isArray(detail)
      ? detail.join(' ')
      : detail ||
        fallback[status] ||
        'Não foi possível comunicar com a API. Tente novamente.',
  );
}
export function settingsInput(settings: Settings): SettingsInput {
  return {
    enabled: settings.enabled,
    generationLimit: settings.generationLimit,
    generationPeriod: settings.generationPeriod,
    budgetUsd: settings.budgetUsd,
    budgetPeriod: settings.budgetPeriod,
    expectedVersion: settings.version,
  };
}
export function settingsValidation(settings: Settings) {
  if (
    !Number.isInteger(settings.generationLimit) ||
    settings.generationLimit < 0 ||
    settings.generationLimit > 2147483647
  )
    return 'Informe um limite inteiro entre 0 e 2147483647.';
  if (!/^(0|[1-9]\d{0,9})(\.\d{1,6})?$/.test(settings.budgetUsd))
    return 'Informe um orçamento em USD não negativo, com até 6 casas decimais.';
  if (
    !periodLabels[settings.generationPeriod] ||
    !periodLabels[settings.budgetPeriod]
  )
    return 'Selecione períodos válidos.';
  return null;
}
export const adminQueryKey = (
  companyId: string,
  actorId: number | undefined,
  kind: string,
  filters?: unknown,
) => [
  'illustration-administration',
  companyId,
  actorId,
  kind,
  ...(filters ? [filters] : []),
];
export function createIllustrationAdministrationApi(
  http: Pick<AxiosInstance, 'get' | 'put'>,
) {
  const base = (companyId: string) =>
    `/v2/companies/${encodeURIComponent(companyId)}/illustration-administration`;
  async function run<T>(action: () => Promise<{ data: T }>) {
    try {
      return (await action()).data;
    } catch (e) {
      throw administrationError(e);
    }
  }
  return {
    settings: (companyId: string) =>
      run<Settings>(() => http.get(base(companyId) + '/settings')),
    save: (companyId: string, body: SettingsInput) =>
      run<Settings>(() => http.put(base(companyId) + '/settings', body)),
    usage: (companyId: string) =>
      run<Usage>(() => http.get(base(companyId) + '/usage')),
    history: (companyId: string, params: HistoryFilter) =>
      run<Page<GenerationHistory>>(() =>
        http.get(base(companyId) + '/generations', { params }),
      ),
    platformUsage: (companyId: string) =>
      run<PlatformMasterUsage>(() =>
        http.get(base(companyId) + '/platform-master/usage'),
      ),
    platformHistory: (companyId: string, params: HistoryFilter) =>
      run<Page<GenerationHistory>>(() =>
        http.get(base(companyId) + '/platform-master/generations', { params }),
      ),
    audit: (companyId: string, params: Pick<HistoryFilter, 'skip' | 'take'>) =>
      run<Page<SettingsAudit>>(() =>
        http.get(base(companyId) + '/settings-audit', { params }),
      ),
  };
}
export type AdministrationApi = ReturnType<
  typeof createIllustrationAdministrationApi
>;
