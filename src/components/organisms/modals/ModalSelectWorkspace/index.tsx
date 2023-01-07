import React, { FC, useEffect, useState } from 'react';

import { Box, Checkbox } from '@mui/material';
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
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

export const initialWorkspaceSelectState = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelect: (work: IWorkspace | IWorkspace[]) => {},
  title: 'Selecione o estabelecimento',
  open: false,
  multiple: false,
  companyId: undefined as string | undefined,
  selected: [] as IWorkspace[],
  onCloseWithoutSelect: () => {},
};

export const ModalSelectWorkspace: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onOpenModal, getStackModal } = useModal();
  const [selectData, setSelectData] = useState(initialWorkspaceSelectState);
  const { data: company } = useQueryCompany(selectData.companyId);

  useEffect(() => {
    const initialData = getModalData(
      ModalEnum.WORKSPACE_SELECT,
    ) as typeof initialWorkspaceSelectState;

    if (initialData && !(initialData as any).passBack) {
      setSelectData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        return newData;
      });
    }
  }, [getModalData]);

  useEffect(() => {
    const isOpen = !!getStackModal().find(
      (modal) => modal.name === ModalEnum.WORKSPACE_SELECT,
    );

    const initialData = getModalData(
      ModalEnum.WORKSPACE_SELECT,
    ) as typeof initialWorkspaceSelectState;

    const workspace = company.workspace;

    if (
      isOpen &&
      workspace &&
      workspace.length === 1 &&
      !initialData.open &&
      (!initialData.companyId ||
        workspace?.[0].companyId === initialData?.companyId)
    ) {
      onCloseModal(ModalEnum.WORKSPACE_SELECT);
      setSelectData(initialWorkspaceSelectState);
      initialData?.onSelect?.(workspace[0]);
    }
  }, [
    getModalData,
    getStackModal,
    onCloseModal,
    company.workspace,
    selectData,
  ]);

  const onCloseNoSelect = () => {
    selectData.onCloseWithoutSelect?.();
    onCloseModal(ModalEnum.WORKSPACE_SELECT);
  };

  const handleSelect = (work?: IWorkspace) => () => {
    if (selectData.multiple && work) {
      setSelectData((oldData) => {
        const filtered = oldData.selected.filter((w) => w.id != work.id);

        if (filtered.length !== oldData.selected.length)
          return { ...oldData, selected: filtered };

        return { ...oldData, selected: [work, ...oldData.selected] };
      });
      return;
    }

    onCloseModal(ModalEnum.WORKSPACE_SELECT);
    selectData.onSelect(work || selectData.selected);
  };

  const handleAddMissingData = () => {
    onOpenModal(ModalEnum.WORKSPACE_ADD);
  };

  const buttons = [{}] as IModalButton[];

  if (selectData.multiple) {
    buttons.push({
      onClick: () => {
        onCloseModal(ModalEnum.WORKSPACE_SELECT);
        selectData.onSelect(selectData.selected);
      },
    });
  }

  return (
    <SModal
      {...registerModal(ModalEnum.WORKSPACE_SELECT)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper center p={8}>
        <SModalHeader tag={'select'} onClose={onCloseNoSelect} title=" " />

        <Box mt={8}>
          {company.workspace && company.workspace.length > 0 ? (
            <SFlex direction="column" gap={5}>
              <SText mt={-4} mr={40}>
                {selectData.title}
              </SText>
              {company.workspace.map((work) => (
                <STableRow clickable onClick={handleSelect(work)} key={work.id}>
                  <SFlex align="center">
                    <Checkbox
                      checked={
                        !!selectData.selected.find((w) => w.id === work.id)
                      }
                      size="small"
                      sx={{
                        'svg[data-testid="CheckBoxOutlineBlankIcon"]': {
                          color: 'grey.400',
                        },
                      }}
                    />
                    {work.name}
                  </SFlex>
                </STableRow>
              ))}
            </SFlex>
          ) : (
            <>
              <SText mt={-4} maxWidth="400px">
                Nenhum estabelecimento cadastrado, por favor cadastre antes de
                gerar um novo documento
              </SText>
              <SButton
                onClick={handleAddMissingData}
                color="secondary"
                sx={{ mt: 5 }}
              >
                Cadastrar Estabelecimento
              </SButton>
            </>
          )}
        </Box>
        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
