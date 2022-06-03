/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useEffect, useRef } from 'react';

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
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

interface IModalSelectWorkspace {
  onSelect: (workspace: IWorkspace, passData: any) => void;
  title?: string;
  onCloseWithoutSelect?: () => void;
}

export const initialRiskGroupState = {
  name: '',
  status: StatusEnum.PROGRESS,
  error: '',
  id: '',
  goTo: '',
};

export const ModalSelectWorkspace: FC<IModalSelectWorkspace> = ({
  onSelect,
  title = 'Selecione o estabelecimento',
  onCloseWithoutSelect,
}) => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const { data: company } = useQueryCompany();
  const initData = useRef<any>({});

  useEffect(() => {
    const initialData = getModalData(ModalEnum.WORKSPACE_SELECT);
    if (initialData) initData.current = initialData;
  }, [getModalData]);

  const onCloseNoSelect = () => {
    onCloseWithoutSelect?.();
    onCloseModal(ModalEnum.WORKSPACE_SELECT);
  };

  const handleSelect = (work: IWorkspace) => () => {
    onCloseModal(ModalEnum.WORKSPACE_SELECT);
    onSelect(work, initData.current);
  };

  const buttons = [{}] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.WORKSPACE_SELECT)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper p={8}>
        <SModalHeader tag={'select'} onClose={onCloseNoSelect} title=" " />

        <Box mt={8}>
          {company.workspace ? (
            <SFlex direction="column" gap={5}>
              <SText mt={-4} mr={40}>
                {title}
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
        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
