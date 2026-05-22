import React, { FC, useEffect, useMemo, useState } from 'react';
import { filterClassificationsForDocumentType } from 'project/enum/document-model-classification.enum';
import { Wizard } from 'react-use-wizard';

import { Box } from '@mui/material';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { STabs } from 'components/molecules/STabs';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { DocumentModelTable } from 'components/organisms/tables/DocumentModelTable/DocumentModelTable';
import { DocumentModelClassificationEnum } from 'project/enum/document-model-classification.enum';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { DocumentModelPgrClassificationFilters } from 'components/organisms/tables/DocumentModelTable/DocumentModelPgrClassificationFilters';

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
      showInactive: true as const,
      ...(activeDocumentType && { type: activeDocumentType }),
      ...(classificationFilters.length > 0 && {
        classifications: classificationFilters,
      }),
      ...data.query,
    }),
    [activeDocumentType, classificationFilters, data.query],
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
