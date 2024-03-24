import React, { FC, useEffect, useState } from 'react';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { ModalAddAccessGroup } from 'components/organisms/modals/ModalAddAccessGroup';
import { ModalAddUsers } from 'components/organisms/modals/ModalAddUsers';
import { ModalSelectAccessGroups } from 'components/organisms/modals/ModalSelectAccessGroup';
import { UsersTable } from 'components/organisms/tables/UsersTable';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { getCompanyName } from 'core/utils/helpers/companyName';

export const initialUsersViewState = {
  title: 'Usuários',
  onCloseWithoutSelect: () => {},
};

export const ModalViewUsers: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const [selectData, setSelectData] = useState(initialUsersViewState);
  const { data: company } = useQueryCompany();
  const companyName = getCompanyName(company);

  useEffect(() => {
    const initialData = getModalData(
      ModalEnum.USER_VIEW,
    ) as typeof initialUsersViewState;

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setSelectData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        return newData;
      });
    }
  }, [getModalData]);

  const onCloseNoSelect = () => {
    selectData.onCloseWithoutSelect?.();
    onCloseModal(ModalEnum.USER_VIEW);
  };

  const buttons = [{}] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.USER_VIEW)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper
        sx={{ backgroundColor: 'grey.200' }}
        semiFullScreen
        center
        p={8}
      >
        <SModalHeader tag={'select'} onClose={onCloseNoSelect} title=" " />

        <Box mt={8} mb={20}>
          <UsersTable
            title={
              <>
                Usuários{' '}
                <span style={{ fontSize: 14 }}>{`(${companyName})`}</span>
              </>
            }
          />
        </Box>

        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};

export const StackModalViewUsers = () => {
  return (
    <>
      <ModalAddUsers />
      <ModalSelectAccessGroups />
      <ModalAddAccessGroup />
    </>
  );
};
