import type { AxiosInstance } from 'axios';
export const ILLUSTRATION_CAPTION =
  'ILUSTRAÇÃO GERADA POR IA —\nNÃO REPRESENTA REGISTRO FOTOGRÁFICO REAL.';
export type Scope = {
  userId: number;
  companyId: string;
  workspaceId: string;
  characterizationId: string;
};
export type IllustrationCapabilities = {
  billingMode?: 'COMPANY' | 'PLATFORM_MASTER';
  billingCompanyId?: string;
  commercialLimitsApply?: boolean;
  canGenerate: boolean;
  available: boolean;
  reason: string | null;
  message?: string;
  generationPeriod?: 'DAY' | 'WEEK' | 'MONTH';
  periodStart?: string;
  attemptsUsed?: number;
  attemptsRemaining?: number;
  userAttemptsRemaining?: number;
  settingsVersion?: number;
};
export function capabilityMessage(value: IllustrationCapabilities) {
  if (value.message) return value.message;
  const reasons: Record<string, string> = {
    ILLUSTRATION_FEATURE_DISABLED:
      'A geração de ilustrações está desabilitada no sistema.',
    ILLUSTRATION_PERMISSION_DENIED:
      'Você não tem autorização para gerar ilustrações. Consulte os grupos de acesso.',
    ILLUSTRATION_COMPANY_DISABLED:
      'A geração de ilustrações está desabilitada para esta empresa.',
    ILLUSTRATION_GALLERY_LIMIT:
      'O elemento atingiu o limite de ilustrações ativas.',
    ILLUSTRATION_USER_DAILY_LIMIT:
      'Seu limite diário de gerações foi atingido.',
    ILLUSTRATION_COMPANY_QUANTITY_LIMIT:
      'O limite de gerações da empresa foi atingido.',
    ILLUSTRATION_USER_CONCURRENT_LIMIT:
      'Você já tem uma geração em andamento ou com resultado incerto.',
    ILLUSTRATION_COMPANY_CONCURRENT_LIMIT:
      'A empresa atingiu o limite de gerações simultâneas.',
    ILLUSTRATION_PAYER_CONCURRENT_LIMIT:
      'A SimpleSST atingiu o limite técnico de gerações simultâneas da plataforma.',
    ILLUSTRATION_COMPANY_BUDGET_LIMIT:
      'O orçamento disponível da empresa foi atingido.',
  };
  return (
    reasons[value.reason || ''] ||
    'A API não autorizou uma nova geração. Atualize a disponibilidade.'
  );
}
export type GenerationStatus =
  | 'GENERATING'
  | 'READY'
  | 'APPROVING'
  | 'APPROVED'
  | 'DISCARDED'
  | 'EXPIRED'
  | 'FAILED'
  | 'UNKNOWN';
export type Generation = {
  billingMode?: 'COMPANY' | 'PLATFORM_MASTER';
  billingCompanyId?: string;
  generationId: string;
  status: GenerationStatus;
  expiresAt: string | null;
  caption: string;
  errorCode?: string;
};
export type Illustration = {
  id: string;
  generationId: string;
  origin: 'AI_GENERATED';
  caption: string;
  generatedAt: string;
  approvedAt: string;
  width: number;
  height: number;
};
export class IllustrationError extends Error {
  constructor(
    public status: number,
    message: string,
    public generationId?: string,
  ) {
    super(message);
  }
}
export async function asIllustrationError(
  error: unknown,
): Promise<IllustrationError> {
  if (error instanceof IllustrationError) return error;
  const response = (error as { response?: { status?: number; data?: any } })
    ?.response;
  let data = response?.data;
  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    try {
      data = JSON.parse(await data.text());
    } catch {
      data = {};
    }
  }
  const fallback: Record<number, string> = {
    400: 'Solicitação inválida.',
    401: 'Sessão expirada. Entre novamente.',
    403: 'Sem permissão para ilustrações.',
    404: 'Recurso indisponível para este elemento.',
    409: 'Operação em andamento. Consulte o status.',
    410: 'Prévia expirada ou indisponível.',
    429: 'Limite ou orçamento atingido.',
    503: 'Não foi possível confirmar a operação. Consulte o status.',
  };
  const status = response?.status || 0;
  return new IllustrationError(
    status,
    (typeof data?.message === 'string' ? data.message : fallback[status]) ||
      'Conexão interrompida. Retome a mesma solicitação; não gere outra automaticamente.',
    data?.generationId,
  );
}
export function createIllustrationApi(
  http: Pick<AxiosInstance, 'get' | 'post' | 'delete'>,
) {
  const base = (s: Scope) =>
    `/v2/companies/${encodeURIComponent(s.companyId)}/workspaces/${encodeURIComponent(s.workspaceId)}/characterizations/${encodeURIComponent(s.characterizationId)}/illustrations`;
  async function run<T>(action: () => Promise<{ data: T }>): Promise<T> {
    try {
      return (await action()).data;
    } catch (e) {
      throw await asIllustrationError(e);
    }
  }
  return {
    capabilities: (s: Scope) =>
      run<IllustrationCapabilities>(() => http.get(base(s) + '/capabilities')),
    list: (s: Scope) => run<Illustration[]>(() => http.get(base(s))),
    generate: (s: Scope, key: string) =>
      run<Generation>(() =>
        http.post(base(s) + '/generations', undefined, {
          headers: { 'Idempotency-Key': key },
          timeout: 210000,
        }),
      ),
    status: (s: Scope, id: string) =>
      run<Generation>(() =>
        http.get(base(s) + '/generations/' + encodeURIComponent(id)),
      ),
    approve: (s: Scope, id: string) =>
      run<Illustration>(() =>
        http.post(
          base(s) + '/generations/' + encodeURIComponent(id) + '/approve',
        ),
      ),
    discard: (s: Scope, id: string) =>
      run<Generation>(() =>
        http.delete(base(s) + '/generations/' + encodeURIComponent(id)),
      ),
    remove: (s: Scope, id: string) =>
      run<unknown>(() => http.delete(base(s) + '/' + encodeURIComponent(id))),
    preview: (s: Scope, id: string, signal?: AbortSignal) =>
      run<Blob>(() =>
        http.get(
          base(s) + '/generations/' + encodeURIComponent(id) + '/preview',
          { responseType: 'blob', signal },
        ),
      ),
    file: (s: Scope, id: string, signal?: AbortSignal) =>
      run<Blob>(() =>
        http.get(base(s) + '/' + encodeURIComponent(id) + '/file', {
          responseType: 'blob',
          signal,
        }),
      ),
  };
}
export type IllustrationApi = ReturnType<typeof createIllustrationApi>;
