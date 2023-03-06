import React, { FC, useEffect, useState } from 'react';

import { Box } from '@mui/material';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { DocumentModelTable } from 'components/organisms/tables/DocumentModelTable/DocumentModelTable';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IQueryDocumentModels } from 'core/services/hooks/queries/useQueryDocumentModels/useQueryDocumentModels';

export const initialDocumentModelsViewState = {
  title: '',
  companyId: undefined as string | undefined,
  query: undefined as IQueryDocumentModels | undefined,
  onCloseWithoutSelect: () => {},
};

const modalName = ModalEnum.DOCUMENTS_MODEL_VIEW;

export const ModalViewDocumentModels: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const [data, setData] = useState(initialDocumentModelsViewState);

  useEffect(() => {
    const initialData = getModalData(
      modalName,
    ) as typeof initialDocumentModelsViewState;

    if (initialData && !(initialData as any).passBack) {
      setData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        return newData;
      });
    }
  }, [getModalData]);

  const onCloseNoSelect = () => {
    data.onCloseWithoutSelect?.();
    onCloseModal(modalName);
  };

  const buttons = [{}] as IModalButton[];

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

        <Box mt={8} mb={20}>
          <DocumentModelTable
            query={data.query}
            title={data.title}
            companyId={data.companyId}
          />
        </Box>

        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};

export const StackModalViewDocumentModels = () => {
  return (
    <>
      <ModalViewDocumentModels />
    </>
  );
};
