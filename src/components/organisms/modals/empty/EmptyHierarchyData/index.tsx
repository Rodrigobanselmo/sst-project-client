import React, { FC } from 'react';

import { Box } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SText from 'components/atoms/SText';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';

interface EmptyProps {
  text?: string;
}

export const EmptyHierarchyData: FC<{ children?: any } & EmptyProps> = ({
  text,
}) => {
  const { onOpenModal, onCloseAllModals } = useModal();
  const { companyId, router } = useGetCompanyId();

  const handleAddExcelData = () => {
    onOpenModal(ModalEnum.HIERARCHIES_EXCEL_ADD);
  };

  const handleAddManuallyData = () => {
    router.push(RoutesEnum.HIERARCHY.replace(':companyId', companyId || ''));
    setTimeout(() => {
      onCloseAllModals();
    }, 200);
  };

  return (
    <Box>
      <SText mt={-4} maxWidth="400px">
        {text || 'Nenhum cargo cadastrado, por favor cadastre antes continuar'}
      </SText>
      <SButton
        onClick={handleAddExcelData}
        color="secondary"
        sx={{ mt: 10, width: '100%' }}
      >
        Cadastrar por planilha
      </SButton>
      <SButton
        sx={{ mt: 7, width: '100%' }}
        onClick={handleAddManuallyData}
        color="secondary"
      >
        Cadastrar pelo sistema
      </SButton>
    </Box>
  );
};
