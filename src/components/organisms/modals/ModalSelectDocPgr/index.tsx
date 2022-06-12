/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useEffect, useRef } from 'react';

import { Box } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { STableRow } from 'components/atoms/STable';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';

interface IModalSelectDocPgr {
  onSelect: (workspace: IRiskGroupData, passData: any) => void;
  title?: string;
  onCloseWithoutSelect?: () => void;
}

export const ModalSelectDocPgr: FC<IModalSelectDocPgr> = ({
  onSelect,
  title = 'Selecione um documento PGR para continuar',
  onCloseWithoutSelect,
}) => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onOpenModal } = useModal();
  const { data: riskGroupData } = useQueryRiskGroupData();
  const initData = useRef<any>({});

  useEffect(() => {
    const initialData = getModalData(ModalEnum.DOC_PGR_SELECT);
    if (initialData) initData.current = initialData;
  }, [getModalData]);

  const onCloseNoSelect = () => {
    onCloseWithoutSelect?.();
    onCloseModal(ModalEnum.DOC_PGR_SELECT);
  };

  const handleSelect = (docPgr: IRiskGroupData) => () => {
    onCloseModal(ModalEnum.DOC_PGR_SELECT);
    onSelect(docPgr, initData.current);
  };

  const handleAddMissingData = () => {
    onOpenModal(ModalEnum.RISK_GROUP_ADD);
  };

  const buttons = [{}] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.DOC_PGR_SELECT)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper p={8}>
        <SModalHeader tag={'select'} onClose={onCloseNoSelect} title=" " />

        <Box mt={8}>
          {riskGroupData.length !== 0 ? (
            <SFlex direction="column" gap={5}>
              <SText mt={-4} mr={40}>
                {title}
              </SText>
              {riskGroupData.map((work) => (
                <STableRow clickable onClick={handleSelect(work)} key={work.id}>
                  {work.name}
                </STableRow>
              ))}
            </SFlex>
          ) : (
            <>
              <SText mt={-4} maxWidth="400px">
                Nenhum documento PGR cadastrado, por favor cadastre um antes
                para poder vincular riscos.
              </SText>
              <SButton
                onClick={handleAddMissingData}
                color="secondary"
                sx={{ mt: 5 }}
              >
                Cadastrar Documento PGR
              </SButton>
            </>
          )}
        </Box>
        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
