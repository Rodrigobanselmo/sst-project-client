import { api } from 'core/services/apiClient';
export const companyRoot = (companyId: string) => `/companies/${companyId}`;
export async function sstGet(companyId: string, path: string) {
  return (await api.get(companyRoot(companyId) + path)).data;
}
export async function sstPost(companyId: string, path: string, body: unknown) {
  return (await api.post(companyRoot(companyId) + path, body)).data;
}
export const messageOf = (error: any) =>
  error.response?.data?.message ||
  error.message ||
  'Não foi possível concluir. Confira os dados antes de tentar novamente.';
export * from './model';
