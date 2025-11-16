import { SIconEdit } from '@v2/assets/icons/SIconEdit/SIconEdit';
import { SIconShare } from '@v2/assets/icons/SIconShare/SIconShare';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { InfoCardAvatar } from '@v2/components/organisms/SInfoCard/components/InfoCardAvatar/InfoCardAvatar';
import { InfoCardSection } from '@v2/components/organisms/SInfoCard/components/InfoCardSection/InfoCardSection';
import { InfoCardText } from '@v2/components/organisms/SInfoCard/components/InfoCardText/InfoCardText';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import SIconDocument from 'assets/icons/SDocumentIcon';
import { FormApplicationShareModal } from './FormApplicationShareModal';
import { FormApplicationStatusChange } from './FormApplicationStatusChange';

export const FormApplicationInfo = ({
  mb,
  formApplication,
  onEdit,
  companyId,
}: {
  mb: number[];
  formApplication: FormApplicationReadModel | null | undefined;
  onEdit: () => void;
  companyId: string;
}) => {
  const { openModal, closeModal } = useModal();

  const handleOpenShareModal = () => {
    if (!formApplication) return;

    openModal(
      ModalKeyEnum.FORM_APPLICATION_SHARE,
      <FormApplicationShareModal
        formApplication={formApplication}
        onClose={() => closeModal(ModalKeyEnum.FORM_APPLICATION_SHARE)}
      />,
    );
  };

  if (!formApplication) {
    return <SSkeleton height={200} sx={{ mb: 10 }} />;
  }

  const isSharable =
    formApplication.isShareableLink || formApplication.isTesting || true;

  return (
    <>
      <SPaper mb={mb}>
        <InfoCardSection gridColumns={'1fr'}>
          <SFlex justifyContent="space-between">
            <SFlex gap={6}>
              <InfoCardAvatar icon={<SIconDocument />} />
              <InfoCardText
                schema="normal"
                label="Nome da Aplicação"
                text={formApplication.name}
              />
            </SFlex>
            <SFlex gap={1} alignItems="center">
              {isSharable && (
                <SIconButton onClick={handleOpenShareModal}>
                  <SIconShare fontSize={22} color="grey.600" />
                </SIconButton>
              )}
              <SIconButton onClick={onEdit}>
                <SIconEdit fontSize={22} color="grey.600" />
              </SIconButton>
            </SFlex>
          </SFlex>
        </InfoCardSection>
        <SDivider />
        <InfoCardSection numColumns={2}>
          <InfoCardText label="Formulário" text={formApplication.form.name} />
          <InfoCardText
            label="Data de Criação"
            text={formApplication.formatCreatedAt}
          />
        </InfoCardSection>
        {(formApplication.formatStartedAt || formApplication.formatEndedAt) && (
          <>
            <SDivider />
            <InfoCardSection numColumns={2}>
              {formApplication.formatStartedAt && (
                <InfoCardText
                  label="Data de Início"
                  text={formApplication.formatStartedAt}
                />
              )}
              {formApplication.formatEndedAt && (
                <InfoCardText
                  label="Data de Término"
                  text={formApplication.formatEndedAt}
                />
              )}
            </InfoCardSection>
          </>
        )}
        {(formApplication.participants.hierarchies.length > 0 ||
          formApplication.participants.workspaces.length > 0) && (
          <>
            <SDivider />
            <InfoCardSection>
              {formApplication.participants.hierarchies.length > 0 && (
                <InfoCardText
                  label="Hierarquias Participantes"
                  text={formApplication.participants.hierarchies
                    .map((h) => h.name)
                    .join(', ')}
                />
              )}
              {formApplication.participants.workspaces.length > 0 && (
                <InfoCardText
                  label="Estabelecimentos Participantes"
                  text={formApplication.participants.workspaces
                    .map((w) => w.name)
                    .join(', ')}
                />
              )}
            </InfoCardSection>
          </>
        )}
        {formApplication.description && (
          <>
            <SDivider />
            <InfoCardSection>
              <InfoCardText
                label="Descrição"
                text={formApplication.description}
              />
            </InfoCardSection>
          </>
        )}

        {/* Action Buttons Section */}
        <SDivider />
        <InfoCardSection>
          <SFlex gap={4} justifyContent="flex-start" flexWrap="wrap">
            {isSharable && (
              <SButton
                text="Compartilhar"
                icon={<SIconShare fontSize={18} />}
                onClick={handleOpenShareModal}
                variant="outlined"
                color="info"
              />
            )}
            <FormApplicationStatusChange
              formApplication={formApplication}
              companyId={companyId}
            />
          </SFlex>
        </InfoCardSection>
      </SPaper>
    </>
  );
};
