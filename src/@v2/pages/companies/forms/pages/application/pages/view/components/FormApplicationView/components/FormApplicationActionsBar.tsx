import { SIconShare } from '@v2/assets/icons/SIconShare/SIconShare';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { FormApplicationShareModal } from './FormApplicationShareModal';
import { FormApplicationDeleteConfirmModal } from './FormApplicationDeleteConfirmModal';
import { FormApplicationStatusChange } from './FormApplicationStatusChange';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { FormCampaignBanner } from './FormCampaignBanner/FormCampaignBanner';

export const FormApplicationActionsBar = ({
  formApplication,
  companyId,
  modelQuestionCount,
}: {
  formApplication: FormApplicationReadModel;
  companyId: string;
  modelQuestionCount?: number | null;
}) => {
  const { openModal, closeModal } = useModal();

  const handleOpenShareModal = () => {
    openModal(
      ModalKeyEnum.FORM_APPLICATION_SHARE,
      <FormApplicationShareModal
        formApplication={formApplication}
        onClose={() => closeModal(ModalKeyEnum.FORM_APPLICATION_SHARE)}
      />,
    );
  };

  const handleOpenDeleteModal = () => {
    openModal(
      ModalKeyEnum.FORM_APPLICATION_DELETE_CONFIRM,
      <FormApplicationDeleteConfirmModal
        formApplication={formApplication}
        companyId={companyId}
        onClose={() => closeModal(ModalKeyEnum.FORM_APPLICATION_DELETE_CONFIRM)}
      />,
    );
  };

  const isSharable =
    formApplication.isShareableLink || formApplication.isTesting || true;

  return (
    <SFlex
      gap={4}
      flexWrap="wrap"
      alignItems="center"
      justifyContent="flex-end"
      sx={{ flexShrink: 0 }}
    >
      {isSharable && (
        <SButton
          text="Compartilhar"
          icon={<SIconShare fontSize={18} />}
          onClick={handleOpenShareModal}
          variant="outlined"
          color="info"
        />
      )}
      {formApplication.form?.type === FormTypeEnum.PSYCHOSOCIAL && (
        <FormCampaignBanner
          formApplication={formApplication}
          companyId={companyId}
          modelQuestionCount={modelQuestionCount}
        />
      )}
      <FormApplicationStatusChange
        formApplication={formApplication}
        companyId={companyId}
      />
      {formApplication.status === FormApplicationStatusEnum.CANCELED && (
        <SButton
          text="Excluir"
          variant="outlined"
          color="danger"
          onClick={handleOpenDeleteModal}
        />
      )}
    </SFlex>
  );
};
