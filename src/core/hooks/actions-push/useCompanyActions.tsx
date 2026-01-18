import { initialWorkspaceState } from 'components/organisms/modals/ModalAddWorkspace/hooks/useEditWorkspace';
import { initialCompanySelectState } from 'components/organisms/modals/ModalSelectCompany';
import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { ICompany } from 'core/interfaces/api/ICompany';
import { useMutSetApplyServiceCompany } from 'core/services/hooks/mutations/manager/company/useMutSetApplyServiceCompany/useMutSetApplyServiceCompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { getCompanyName } from 'core/utils/helpers/companyName';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

type IPerformActions = { shouldPush?: boolean };

export const useCompanyActions = () => {
  const history = useRouter();
  const { data: company } = useQueryCompany();
  const companyName = getCompanyName(company);
  const { onStackOpenModal } = useModal();

  const setApplyCompanyMutation = useMutSetApplyServiceCompany();

  const onAddCompany = useCallback(
    async ({ shouldPush }: IPerformActions) => {
      if (shouldPush) {
        await history.push({ pathname: RoutesEnum.COMPANIES });
      }

      onStackOpenModal(ModalEnum.COMPANY_EDIT);
    },
    [history, onStackOpenModal],
  );

  const onEditCompany = useCallback(async () => {
    await history.push({
      pathname: RoutesEnum.COMPANY_EDIT.replace(':companyId', company.id),
    });

    onStackOpenModal(ModalEnum.COMPANY_EDIT, company);
  }, [company, history, onStackOpenModal]);

  const onSelectCompany = useCallback(async () => {
    const element = document.querySelector(`#${IdsEnum.COMPANY_SELECT_NAVBAR}`);
    if (element && 'click' in element) {
      await history.push({
        pathname: RoutesEnum.COMPANY_EDIT.replace(':companyId', company.id),
      });
      (element as any)?.click?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEditApplyServiceCompany = useCallback(
    async (props?: IPerformActions) => {
      if (props?.shouldPush) {
        await history.push({
          pathname: RoutesEnum.COMPANY_EDIT.replace(':companyId', company.id),
        });
      }

      const __company = company;

      onStackOpenModal(ModalEnum.COMPANY_SELECT, {
        title: `Selecione as empresas que podem acessar os dados da empresa ${companyName}`,
        ...(__company.receivingServiceContracts?.length && {
          query: {
            companiesIds: __company.receivingServiceContracts.map(
              (rec) => rec.applyingServiceCompanyId,
            ),
          },
        }),
        selected:
          __company?.receivingServiceContracts?.map((rec) => ({
            id: rec.applyingServiceCompanyId,
          })) || [],
        onSelect: (company: ICompany[]) =>
          setApplyCompanyMutation.mutate({
            companyId: __company.id,
            applyServiceIds: company.map(({ id }) => id),
          }),
        multiple: true,
      } as Partial<typeof initialCompanySelectState>);
    },
    [company, companyName, history, onStackOpenModal, setApplyCompanyMutation],
  );

  const onAddWorspace = useCallback(async () => {
    const data: Partial<typeof initialWorkspaceState> = {
      name: company.type,
      cep: company?.address?.cep,
      number: company?.address?.number,
      city: company?.address?.city,
      complement: company?.address?.complement,
      state: company?.address?.state,
      street: company?.address?.street,
      neighborhood: company?.address?.neighborhood,
      logoUrl: company?.logoUrl,
    };

    await history.push({
      pathname: RoutesEnum.COMPANY_EDIT.replace(':companyId', company.id),
    });

    const isFirstWorkspace = company.workspace && company.workspace.length == 0;
    onStackOpenModal(ModalEnum.WORKSPACE_ADD, isFirstWorkspace ? data : {});
  }, [company, history, onStackOpenModal]);

  const onEditWorspace = useCallback(async () => {
    await history.push({
      pathname: RoutesEnum.COMPANY_EDIT.replace(':companyId', company.id),
    });
  }, [company, history]);

  return {
    onAddCompany,
    onEditApplyServiceCompany,
    onEditCompany,
    onAddWorspace,
    onEditWorspace,
    onSelectCompany,
  };
};
