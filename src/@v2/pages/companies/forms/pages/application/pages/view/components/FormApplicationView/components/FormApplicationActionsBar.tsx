import { Box, useTheme } from '@mui/material';
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
import { CampaignBannerAssistant } from './FormCampaignBanner/CampaignBannerAssistant';
import { FormCampaignBanner } from './FormCampaignBanner/FormCampaignBanner';
import { ClosingReviewModal } from './closing-review/ClosingReviewModal';
import { canShowClosingAuditAction } from './closing-review/closing-review-ui.rules';
import { useAccess } from 'core/hooks/useAccess';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import { useState } from 'react';

export const FormApplicationActionsBar = ({
  formApplication,
  companyId,
  modelQuestionCount,
}: {
  formApplication: FormApplicationReadModel;
  companyId: string;
  modelQuestionCount?: number | null;
}) => {
  const { palette } = useTheme();
  const infoButtonSchema =
    palette.mode === 'dark'
      ? { color: 'info.light', borderColor: 'info.light' }
      : undefined;
  const { openModal, closeModal } = useModal();
  const { isMaster } = useAccess();
  const [auditOpen, setAuditOpen] = useState(false);
  const showAuditAction = canShowClosingAuditAction({
    isMaster,
    formType: formApplication.form?.type,
  });

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
      <Box
        sx={{
          display: 'contents',
          '&& .MuiButton-root': {
            color: 'text.primary',
            borderColor: 'divider',
            background:
              palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.035))'
                : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4))',
            backdropFilter: 'blur(16px) saturate(140%)',
            WebkitBackdropFilter: 'blur(16px) saturate(140%)',
            transition:
              'background-color 160ms ease, border-color 160ms ease, transform 160ms ease',
            '&:hover': {
              color: palette.mode === 'dark' ? '#F9D43B' : '#1565C0',
              backgroundColor: 'action.hover',
              borderColor: 'text.secondary',
              transform: 'translateY(-1px)',
            },
            '&:active': { transform: 'translateY(0)' },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'text.secondary',
              outlineOffset: 2,
            },
            '& *': {
              color: 'inherit',
            },
          },
        }}
      >
        {isSharable && (
          <SButton
            text="Compartilhar"
            icon={<SIconShare fontSize={18} />}
            onClick={handleOpenShareModal}
            variant="outlined"
            color="info"
            schema={infoButtonSchema}
          />
        )}
        {formApplication.form?.type === FormTypeEnum.PSYCHOSOCIAL && (
          <FormCampaignBanner
            formApplication={formApplication}
            companyId={companyId}
            modelQuestionCount={modelQuestionCount}
          />
        )}
        {formApplication.form?.type !== FormTypeEnum.PSYCHOSOCIAL && (
          <CampaignBannerAssistant
            formApplication={formApplication}
            companyId={companyId}
            modelQuestionCount={modelQuestionCount}
          />
        )}
        {showAuditAction && (
          <SButton
            text="Auditar consistência"
            icon={<FactCheckOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={() => setAuditOpen(true)}
            variant="outlined"
            color="info"
            schema={infoButtonSchema}
          />
        )}
      </Box>
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
      {showAuditAction && (
        <ClosingReviewModal
          open={auditOpen}
          mode="audit"
          companyId={companyId}
          applicationId={formApplication.id}
          onClose={() => setAuditOpen(false)}
        />
      )}
    </SFlex>
  );
};
