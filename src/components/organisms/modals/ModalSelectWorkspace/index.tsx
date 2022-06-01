import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STableRow } from 'components/atoms/STable';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { useRouter } from 'next/router';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

export const initialRiskGroupState = {
  name: '',
  status: StatusEnum.PROGRESS,
  error: '',
  id: '',
  goTo: '',
};

export const ModalSelectWorkspace = () => {
  const { registerModal } = useRegisterModal();
  const { onCloseModal } = useModal();
  const { data: company } = useQueryCompany();
  const { push } = useRouter();

  const onClose = () => {
    onCloseModal(ModalEnum.WORKSPACE_SELECT);
  };

  const handleSelect = (work: IWorkspace) => () => {
    push({
      pathname: RoutesEnum.COMPANY_PGR.replace(
        ':companyId',
        company.id,
      ).replace(':workspaceId', work.id),
    });
    onClose();
  };

  const buttons = [{}] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.WORKSPACE_SELECT)}
      keepMounted={false}
      onClose={onClose}
    >
      <SModalPaper p={8}>
        <SModalHeader tag={'select'} onClose={onClose} title=" " />

        <Box mt={8}>
          {company.workspace ? (
            <SFlex direction="column" gap={5}>
              <SText mt={-4} mr={40}>
                Selecione o estabelecimento para o documento PGR
              </SText>
              {company.workspace.map((work) => (
                <STableRow clickable onClick={handleSelect(work)} key={work.id}>
                  {work.name}
                </STableRow>
              ))}
            </SFlex>
          ) : (
            <SText mt={-4} maxWidth="400px">
              Nenhum estabelecimento cadastrado, por favor cadastre antes de
              gerar um novo documento
            </SText>
          )}
        </Box>
        <SModalButtons onClose={onClose} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
