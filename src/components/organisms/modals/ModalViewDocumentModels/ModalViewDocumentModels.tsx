import React, { FC, useEffect, useMemo, useState } from 'react';
import { filterClassificationsForDocumentType } from 'project/enum/document-model-classification.enum';

import { Box } from '@mui/material';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { STabs } from 'components/molecules/STabs';
import { DocumentModelTable } from 'components/organisms/tables/DocumentModelTable/DocumentModelTable';
import { DocumentModelClassificationEnum } from 'project/enum/document-model-classification.enum';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { DocumentModelPgrClassificationFilters } from 'components/organisms/tables/DocumentModelTable/DocumentModelPgrClassificationFilters';
import { DocumentModelStatusFilters } from 'components/organisms/tables/DocumentModelTable/DocumentModelStatusFilters';
import {
  buildDocumentModelStatusQuery,
  DocumentModelStatusFilter,
  documentModelStatusEmptyMessage,
} from 'components/organisms/tables/DocumentModelTable/document-model-status-filter.util';

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
  const [activeStep, setActiveStep] = useState(0);
  const [classificationFilters, setClassificationFilters] = useState<
    DocumentModelClassificationEnum[]
  >([]);
  const [statusFilter, setStatusFilter] =
    useState<DocumentModelStatusFilter>('ACTIVE');

  const typeMap: Record<number, DocumentTypeEnum> = {
    0: DocumentTypeEnum.PGR,
    1: DocumentTypeEnum.PCSMO,
    2: DocumentTypeEnum.LTCAT,
    3: DocumentTypeEnum.PERICULOSIDADE,
    4: DocumentTypeEnum.INSALUBRIDADE,
    5: DocumentTypeEnum.FRPS,
  };

  const activeDocumentType = data.query?.type ?? typeMap[activeStep];

  useEffect(() => {
    if (!activeDocumentType) return;
    setClassificationFilters((prev) =>
      filterClassificationsForDocumentType(prev, activeDocumentType),
    );
  }, [activeDocumentType]);

  const tableQuery = useMemo(
    () => ({
      ...data.query,
      ...(activeDocumentType && { type: activeDocumentType }),
      ...(classificationFilters.length > 0
        ? { classifications: classificationFilters }
        : { classifications: undefined }),
      // Status filter must win over any opener query defaults.
      ...buildDocumentModelStatusQuery(statusFilter),
    }),
    [activeDocumentType, classificationFilters, data.query, statusFilter],
  );

  useEffect(() => {
    const initialData = getModalData(
      modalName,
    ) as typeof initialDocumentModelsViewState;

    // eslint-disable-next-line prettier/prettier
    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      setData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        return newData;
      });
      // Reset status filter whenever the modal opens with fresh data.
      setStatusFilter('ACTIVE');
      setActiveStep(0);
      setClassificationFilters([]);
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
            query={tableQuery}
            title={data.title}
            companyId={data.companyId}
            emptyMessage={documentModelStatusEmptyMessage(statusFilter)}
          >
            {!data.query?.type && (
              <STabs
                value={activeStep}
                onChange={(_, value) => {
                  setActiveStep(value);
                  setClassificationFilters([]);
                }}
                shadow
                options={[
                  {
                    label: 'PGR',
                  },
                  {
                    label: 'PCMSO',
                  },
                  {
                    label: 'LTCAT',
                  },
                  {
                    label: 'Periculosidade',
                  },
                  {
                    label: 'Insalubridade',
                  },
                  {
                    label: 'FRPS',
                  },
                ]}
              />
            )}
            <DocumentModelStatusFilters
              active={statusFilter}
              onChange={setStatusFilter}
            />
            {activeDocumentType && (
              <DocumentModelPgrClassificationFilters
                documentType={activeDocumentType}
                active={classificationFilters}
                onChange={setClassificationFilters}
              />
            )}
          </DocumentModelTable>
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
