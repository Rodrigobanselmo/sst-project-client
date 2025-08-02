import React, { FC, useEffect, useState } from 'react';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { ClinicExamsTable } from 'components/organisms/tables/ClinicExamsTable/ClinicExamsTable';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IExamToClinic } from 'core/interfaces/api/IExam';

export const initialClinicExamsViewState = {
  onSelect: undefined as
    | ((ClinicExams: IExamToClinic | IExamToClinic[]) => void)
    | undefined,
  title: '',
  multiple: false,
  selected: [] as IExamToClinic[],
  onCloseWithoutSelect: () => {},
};

const modalName = ModalEnum.CLINIC_EXAMS_SELECT;

export const ModalViewClinicExams: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const [selectData, setSelectData] = useState(initialClinicExamsViewState);

  useEffect(() => {
    const initialData = getModalData(
      modalName,
    ) as typeof initialClinicExamsViewState;

    // eslint-disable-next-line prettier/prettier
    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
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
    onCloseModal(modalName);
  };

  const handleSelect = (ClinicExams?: IExamToClinic) => {
    if (selectData.multiple && ClinicExams) {
      setSelectData((oldData) => {
        const filtered = oldData.selected.filter((w) => w.id != ClinicExams.id);

        if (filtered.length !== oldData.selected.length)
          return { ...oldData, selected: filtered };

        return { ...oldData, selected: [ClinicExams, ...oldData.selected] };
      });
      return;
    }
    onCloseModal(modalName);
    setSelectData(initialClinicExamsViewState);
    selectData?.onSelect?.(ClinicExams || selectData.selected);
  };

  const buttons = [{}] as IModalButton[];

  if (selectData.multiple) {
    buttons.push({
      onClick: () => {
        onCloseModal(modalName);
        selectData?.onSelect?.(selectData.selected);
      },
    });
  }

  return (
    <SModal
      {...registerModal(modalName)}
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

        {selectData.title && (
          <SText mt={-4} mr={40}>
            {selectData.title}
          </SText>
        )}
        <Box mt={8}>
          <ClinicExamsTable
            {...(selectData.multiple
              ? { selectedData: selectData.selected }
              : {})}
            {...(selectData.onSelect ? { onSelectData: handleSelect } : {})}
            rowsPerPage={12}
          />
        </Box>

        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
