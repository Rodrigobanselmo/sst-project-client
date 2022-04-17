import { useRouter } from 'next/router';

import { useAuth } from 'core/contexts/AuthContext';

export const useGetCompanyId = () => {
  const { user } = useAuth();
  const router = useRouter();

  const companyId =
    (user && ((router.query.companyId as string) || user?.companyId)) ||
    undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getCompanyId = (data: any) => {
    if (Array.isArray(data) && data.length > 0 && data[0]?.companyId) {
      return data[0]?.companyId as string;
    } else if (typeof data === 'string' && data) {
      return data;
    } else if (data?.companyId) {
      return data.companyId as string;
    }

    return companyId || '';
  };

  return { companyId, getCompanyId, user, router };
};
