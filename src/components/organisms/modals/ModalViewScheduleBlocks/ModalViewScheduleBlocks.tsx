import React, { FC, useEffect, useState } from 'react';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { ScheduleBlockTable } from 'components/organisms/tables/ScheduleBlockTable/ScheduleBlockTable';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IScheduleBlock } from 'core/interfaces/api/IScheduleBlock';
import { IQueryScheduleBlocks } from 'core/services/hooks/queries/block/useQueryScheduleBlocks/useQueryScheduleBlocks';

export const initialScheduleBlockViewState = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelect: (professional: IScheduleBlock | IScheduleBlock[]) => {},
  title: 'Bloqueio de Agenda',
  multiple: false,
  query: {} as IQueryScheduleBlocks,
  selected: [] as IScheduleBlock[],
  toEdit: false,
  onCloseWithoutSelect: () => {},
};

export const ModalViewScheduleBlocks: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const [selectData, setSelectData] = useState(initialScheduleBlockViewState);

  useEffect(() => {
    const initialData = getModalData(
      ModalEnum.SCHEDULE_BLOCK_SELECT,
    ) as typeof initialScheduleBlockViewState;

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

  const onCloseNoSelect = () => {
    selectData.onCloseWithoutSelect?.();
    onCloseModal(ModalEnum.SCHEDULE_BLOCK_SELECT);
  };

  const handleSelect = (professional?: IScheduleBlock) => {
    if (selectData.multiple && professional) {
      setSelectData((oldData) => {
        const filtered = oldData.selected.filter(
          (w) => w.id != professional.id,
        );

        if (filtered.length !== oldData.selected.length)
          return { ...oldData, selected: filtered };

        return { ...oldData, selected: [professional, ...oldData.selected] };
      });
      return;
    }
    onCloseModal(ModalEnum.SCHEDULE_BLOCK_SELECT);
    setSelectData(initialScheduleBlockViewState);
    selectData.onSelect(professional || selectData.selected);
  };

  const buttons = [{}] as IModalButton[];

  if (selectData.multiple) {
    buttons.push({
      onClick: () => {
        onCloseModal(ModalEnum.SCHEDULE_BLOCK_SELECT);
        selectData.onSelect(selectData.selected);
      },
    });
  }

  return (
    <SModal
      {...registerModal(ModalEnum.SCHEDULE_BLOCK_SELECT)}
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

        <SText mt={-4} mr={40}>
          {selectData.title}
        </SText>
        <Box mt={8}>
          <ScheduleBlockTable
            {...(selectData.multiple
              ? { selectedData: selectData.selected }
              : {})}
            {...(!selectData.toEdit ? { onSelectData: handleSelect } : {})}
            // query={selectData.query}
            rowsPerPage={6}
          />
        </Box>

        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
