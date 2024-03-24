import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

export const useUserActions = () => {
  const history = useRouter();
  const { data: company } = useQueryCompany();
  const { onStackOpenModal } = useModal();

  const onViewUser = useCallback(async () => {
    await history.push({
      pathname: RoutesEnum.COMPANY_EDIT.replace(':companyId', company.id),
    });

    onStackOpenModal(ModalEnum.USER_VIEW, company);
  }, [company, history, onStackOpenModal]);

  return {
    onViewUser,
  };
};
