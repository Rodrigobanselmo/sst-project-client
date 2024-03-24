import { useOpenRiskTool } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/hooks/useOpenRiskTool';
import { ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';
import { ViewTypeEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-risk-type.constant';
import { initialDocPgrSelectState } from 'components/organisms/modals/ModalSelectDocPgr';
import { useAuth } from 'core/contexts/AuthContext';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import {
  setGhoSearch,
  setGhoSelectedId,
} from 'store/reducers/hierarchy/ghoSlice';
import { useAppDispatch } from '../useAppDispatch';

export const useRiskActions = () => {
  const history = useRouter();
  const { user } = useAuth();
  const { data: company } = useQueryCompany();
  const { onOpenRiskToolSelected, onStackOpenModal } = useOpenRiskTool();
  const dispatch = useAppDispatch();

  const onViewRisk = useCallback(async () => {
    if (user?.companyId)
      await history.push({
        pathname: RoutesEnum.RISKS.replace(':companyId', user?.companyId),
      });
  }, [history, user?.companyId]);

  const onViewCompanyRisks = useCallback(async () => {
    await history.push({
      pathname: RoutesEnum.COMPANY_SST.replace(':companyId', company.id),
    });
  }, [company.id, history]);

  const onOpenRiskModal = useCallback(
    async ({
      viewsDataInit = ViewsDataEnum.HIERARCHY,
      viewTypeInit = ViewTypeEnum.SIMPLE_BY_GROUP,
      resetSearch,
      addByEmployee,
    }: {
      viewsDataInit?: ViewsDataEnum;
      viewTypeInit?: ViewTypeEnum;
      resetSearch?: boolean;
      addByEmployee?: boolean;
    }) => {
      await history.push({
        pathname: RoutesEnum.COMPANY_SST.replace(':companyId', company.id),
      });

      if (resetSearch) {
        dispatch(setGhoSearch(''));
        dispatch(setGhoSelectedId(null));
      }

      if (addByEmployee) {
        onStackOpenModal(ModalEnum.AUTOMATE_SUB_OFFICE);
      }

      onStackOpenModal(ModalEnum.DOC_PGR_SELECT, {
        title:
          'Selecione para qual Sistema de Gestão SST deseja adicionar os fatores de risco',
        onSelect: (docPgr: IRiskGroupData) =>
          onOpenRiskToolSelected({
            riskGroupId: docPgr.id,
            viewsDataInit,
            viewTypeInit,
          }),
      } as Partial<typeof initialDocPgrSelectState>);
    },
    [company.id, dispatch, history, onOpenRiskToolSelected, onStackOpenModal],
  );

  return {
    onOpenRiskModal,
    onViewRisk,
    onViewCompanyRisks,
  };
};
