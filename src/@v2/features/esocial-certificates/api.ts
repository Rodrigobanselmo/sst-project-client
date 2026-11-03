import { api } from 'core/services/apiClient';

export type Certificate = {
  id: string;
  label: string;
  ownerCompanyId: string;
  registration: string;
  registrationType: number;
  subject: string;
  issuer: string;
  fingerprint: string;
  notBefore: string;
  notAfter: string;
  createdAt: string;
  disabledAt: string | null;
  supersededById: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'NOT_YET_VALID' | 'DISABLED' | 'REPLACED';
  scope?: 'COMPANY' | 'PLATFORM';
};
export type Employer = { id: string; name: string; cnpj: string };
export type Binding = {
  companyId: string;
  credentialId: string;
  enabled: boolean;
  mode: 'OWN' | 'PROXY';
  revision: number;
  authorizationExpiresAt: string | null;
  authorizationDeclaredAt: string | null;
  authorizationStatus: string;
  credential: Certificate;
  company?: Employer;
};
export type Vault = {
  configured: boolean;
  certificates: Certificate[];
  bindings?: Binding[];
  platformAdministrationAllowed?: boolean;
};
export type CertificateScope = 'COMPANY' | 'PLATFORM';
export type PlatformBinding = Pick<
  Binding,
  'credentialId' | 'enabled' | 'revision' | 'credential'
>;
export type PlatformVault = {
  configured: boolean;
  certificates: Certificate[];
  binding: PlatformBinding | null;
};
export type CertificateAssignment = {
  companyId: string;
  mode: 'OWN' | 'PROXY';
  expectedRevision: number;
  authorizationDeclared?: boolean;
  authorizationExpiresAt?: string;
};
export const vaultRoot = (
  owner: string,
  scope: CertificateScope = 'COMPANY',
) =>
  scope === 'PLATFORM'
    ? '/admin/esocial-credentials'
    : `/companies/${owner}/esocial-credentials`;
export async function fetchVault(
  owner: string,
  scope: CertificateScope = 'COMPANY',
): Promise<Vault> {
  return (await api.get(vaultRoot(owner, scope))).data;
}
export async function fetchEmployers(owner: string): Promise<Employer[]> {
  return (await api.get(vaultRoot(owner) + '/targets')).data;
}
export async function fetchBinding(
  owner: string,
  employer: string,
): Promise<Binding | null> {
  return (await api.get(vaultRoot(owner) + '/bindings/' + employer)).data;
}
export async function fetchPlatformBinding(): Promise<PlatformBinding | null> {
  return (await api.get(vaultRoot('', 'PLATFORM') + '/binding')).data;
}
export async function uploadCertificate(
  owner: string,
  file: File,
  password: string,
  label: string,
  operationId: string,
  replaces?: string,
  scope: CertificateScope = 'COMPANY',
  configuration?: {
    binding?: CertificateAssignment;
    activation?: { expectedRevision: number };
  },
) {
  const body = new FormData();
  body.append('file', file);
  body.append('password', password);
  body.append('label', label);
  body.append('operationId', operationId);
  if (!replaces && configuration?.binding)
    body.append('binding', JSON.stringify(configuration.binding));
  if (!replaces && configuration?.activation)
    body.append('activation', JSON.stringify(configuration.activation));
  return (
    await api.post(
      vaultRoot(owner, scope) + (replaces ? `/${replaces}/renew` : ''),
      body,
    )
  ).data as Certificate;
}
export const certificateMessage = (error: any) =>
  error?.response?.data?.message ||
  'Não foi possível concluir. Tente novamente.';
