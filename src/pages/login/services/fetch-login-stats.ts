import { CompanyRoutes } from '@v2/constants/routes/company.routes';
import { api } from 'core/services/apiClient';

export type LoginStatsCounts = {
  companies: number;
  workers: number;
  documents: number;
};

function isLoginStatsCounts(value: unknown): value is LoginStatsCounts {
  if (!value || typeof value !== 'object') return false;
  const stats = value as Record<string, unknown>;
  return (
    typeof stats.companies === 'number' &&
    Number.isFinite(stats.companies) &&
    typeof stats.workers === 'number' &&
    Number.isFinite(stats.workers) &&
    typeof stats.documents === 'number' &&
    Number.isFinite(stats.documents)
  );
}

export async function fetchLoginStats(): Promise<LoginStatsCounts | null> {
  try {
    const response = await api.get<LoginStatsCounts>(
      CompanyRoutes.PUBLIC_LOGIN_STATS,
    );
    return isLoginStatsCounts(response.data) ? response.data : null;
  } catch {
    return null;
  }
}
