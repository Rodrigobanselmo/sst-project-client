import { Box } from '@mui/material';
import { SIconEdit } from '@v2/assets/icons/SIconEdit/SIconEdit';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { SDocumentControlFileTable } from '@v2/components/organisms/STable/implementation/SDocumentControlFileTable/SDocumentControlFileTable';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { InfoCardAvatar } from '@v2/pages/companies/action-plan/components/ActionPlanInfo/components/InfoCardAvatar';
import { InfoCardSection } from '@v2/pages/companies/action-plan/components/ActionPlanInfo/components/InfoCardSection';
import { InfoCardText } from '@v2/pages/companies/action-plan/components/ActionPlanInfo/components/InfoCardText';
import { useFetchReadDocumentControl } from '@v2/services/enterprise/document-control/document-control/read-document-control/hooks/useFetchReadDocumentControl';

export const DocumentControlView = ({
  companyId,
  documentControlId,
}: {
  companyId: string;
  documentControlId: number;
}) => {
  const { closeModal } = useModal();
  const { documentControl, isLoading } = useFetchReadDocumentControl({
    companyId,
    documentControlId,
  });

  const onClose = () => {
    closeModal(ModalKeyEnum.DOCUMENT_CONTROL_ADD);
  };

  const onEdit = () => {
    closeModal(ModalKeyEnum.DOCUMENT_CONTROL_ADD);
  };

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.DOCUMENT_CONTROL_ADD}
      title={'Detalhes do Documento'}
      loading={isLoading}
      minWidthDesk={600}
      onSubmit={onClose}
    >
      {isLoading || !documentControl ? (
        <SSkeleton height={200} />
      ) : (
        <SFlex direction="column" gap={6}>
          <SPaper shadow={false}>
            <InfoCardSection gridColumns={'1fr 1fr 40px'}>
              <InfoCardText label="Nome" text={documentControl?.name} />
              <InfoCardText label="Tipo" text={documentControl?.type} />
              <SIconButton onClick={onEdit}>
                <SIconEdit fontSize={22} color="grey.600" />
              </SIconButton>
            </InfoCardSection>
            <SDivider />
            <InfoCardSection>
              <InfoCardText
                label="Descrição"
                text={documentControl.description || '-'}
              />
            </InfoCardSection>
          </SPaper>
          <SDocumentControlFileTable
            data={documentControl.files}
            onSelectRow={() => {}}
          />
        </SFlex>
      )}
    </SModalWrapper>
  );
};
