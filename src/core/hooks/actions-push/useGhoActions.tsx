import { initialCompanySelectState } from 'components/organisms/modals/ModalSelectCompany';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useImportExport } from 'core/hooks/useImportExport';
import { useModal } from 'core/hooks/useModal';
import { ICompany } from 'core/interfaces/api/ICompany';
import { GetCompanyStructureResponse } from 'core/services/hooks/mutations/general/useMutUploadFile/types';
import { useMutSetApplyServiceCompany } from 'core/services/hooks/mutations/manager/company/useMutSetApplyServiceCompany/useMutSetApplyServiceCompany';
import { ReportTypeEnum } from 'core/services/hooks/mutations/reports/useMutReport/types';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { queryClient } from 'core/services/queryClient';
import { getCompanyName } from 'core/utils/helpers/companyName';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

type IPerformActions = { shouldPush?: boolean };

export const useGhoActions = () => {
  const history = useRouter();
  const { data: company } = useQueryCompany();
  const { onStackOpenModal } = useModal();

  const onViewGho = useCallback(async () => {
    await history.push({
      pathname: RoutesEnum.GHOS.replace(':companyId', company.id),
    });
  }, [company, history]);

  return {
    onViewGho,
  };
};
