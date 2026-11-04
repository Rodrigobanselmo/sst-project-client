import { api } from 'core/services/apiClient';
export const AI_ACCOUNTING_ROOT = '/v2/platform/ai-accounting';
export type Lookup = { id: string; label: string };
export type BudgetPolicy = {
  scope: string;
  limitUsd: string;
  enabled: boolean;
  version: number;
  spentUsd: string;
  availableUsd?: string;
};
export type Tariff = {
  provider: 'openai' | 'gemini' | 'tavily';
  model: string;
  version: number;
  inputUsdPerMillion: string;
  cachedInputUsdPerMillion: string;
  outputUsdPerMillion: string;
  audioUsdPerMinute: string;
  requestUsd?: string;
  origin?: 'OFFICIAL' | 'CUSTOM';
  catalogVersion?: string;
  reviewedAt?: string;
  canCustomize?: boolean;
  hasOfficialPrice?: boolean;
  pricingNote?: string;
  sourceUrl: string;
  validUntil: string;
};
export type AccountingState = {
  infrastructureEnabled: boolean;
  timezone: string;
  day?: string;
  policies: BudgetPolicy[];
  tariffs: Tariff[];
  catalog?: {
    version: string;
    reviewedAt: string;
    validUntil: string;
    modelCount: number;
    providers: string[];
  };
};
export type ReportRow = {
  key: string;
  calls: string;
  costUnits: string;
  costUsd: string;
  unmeteredCalls: string;
  userName: string | null;
  companyName: string | null;
  payerName: string | null;
};
export type Attempt = {
  id: string;
  userId: number | null;
  systemActor: string | null;
  userName: string | null;
  companyName: string | null;
  targetCompanyId: string;
  payerCompanyId: string;
  workflow: string;
  stage: string;
  provider: string;
  model: string;
  status: string;
  costUsd: string | null;
  startedAt: string;
  providerRequestId: string | null;
};
export const workflowLabels: Record<string, string> = {
  CHAT: 'Chat',
  IMAGES: 'Imagens',
  CHARACTERIZATION: 'Caracterização',
  GSE: 'GSE',
  FORMS: 'Formulários e diagnósticos',
  MEDICINE: 'Medicina e exames',
  CATALOG: 'Catálogos e curadoria',
};
export const groupLabels: Record<string, string> = {
  company: 'Empresa atendida',
  payer: 'Empresa pagadora',
  user: 'Usuário / rotina',
  workflow: 'Fluxo',
  stage: 'Etapa',
  model: 'Provedor e modelo',
  day: 'Dia',
};
export const todayInSaoPaulo = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
/** Display conversion only. All arithmetic and admission use precise integers on the server. */
export const usd = (value?: string | null) =>
  value == null
    ? 'Sem medição'
    : new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }).format(Number(value));
export const accountingError = (error: unknown) => {
  const e = error as {
    response?: { data?: { message?: unknown } };
    message?: string;
  };
  const message = e?.response?.data?.message;
  if (typeof message === 'string') return message;
  if (Array.isArray(message))
    return message.filter((m) => typeof m === 'string').join(' ');
  return e?.message || 'Não foi possível consultar o consumo de IA.';
};
export async function fetchAccountingState(): Promise<AccountingState> {
  return (await api.get(AI_ACCOUNTING_ROOT + '/state')).data;
}
