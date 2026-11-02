import { useQuery } from 'react-query';
import { useAuth } from 'core/contexts/AuthContext';
import { fetchVault } from './api';

export function usePlatformCertificateAccess() {
  const { user } = useAuth();
  const ownerId = user?.companyId || '';
  const isMaster = user?.roles?.includes('master') === true;
  const query = useQuery(
    ['esocial-certificates', ownerId, 'COMPANY'],
    () => fetchVault(ownerId),
    { enabled: !!ownerId && isMaster, retry: false },
  );
  return {
    allowed: isMaster && query.data?.platformAdministrationAllowed === true,
    loading: isMaster && query.isLoading,
    error: query.isError,
    retry: query.refetch,
  };
}
