import { Box, Typography, useTheme } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SModalHeader } from '@v2/components/organisms/SModal/components/SModalHeader/SModalHeader';
import { SModalPaper } from '@v2/components/organisms/SModal/components/SModalPaper/SModalPaper';
import { FORM_TAB_ENUM, PageRoutes } from '@v2/constants/pages/routes';
import { useAppRouter } from '@v2/hooks/useAppRouter';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { useMutateSoftDeleteFormApplication } from '@v2/services/forms/form-application/soft-delete-form-application/hooks/useMutateSoftDeleteFormApplication';

interface FormApplicationDeleteConfirmModalProps {
  formApplication: FormApplicationReadModel;
  companyId: string;
  onClose: () => void;
}

export const FormApplicationDeleteConfirmModal = ({
  formApplication,
  companyId,
  onClose,
}: FormApplicationDeleteConfirmModalProps) => {
  const theme = useTheme();
  const dangerColor =
    theme.palette.mode === 'dark'
      ? theme.palette.error.light
      : theme.palette.error.dark;
  const router = useAppRouter();
  const { mutate: softDelete, isPending } =
    useMutateSoftDeleteFormApplication();

  const handleConfirm = () => {
    softDelete(
      { companyId, applicationId: formApplication.id },
      {
        onSuccess: () => {
          onClose();
          router.push(PageRoutes.FORMS.FORMS_APPLICATION.LIST, {
            pathParams: { companyId, formTab: FORM_TAB_ENUM.APPLIED },
          });
        },
      },
    );
  };

  return (
    <SModalPaper
      center
      minWidthDesk={480}
      maxWidthDesk={480}
      sx={{
        width: 'calc(100vw - 32px)',
        minWidth: 0,
        maxWidth: '480px',
        color: 'text.primary',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '12px',
      }}
    >
      <SModalHeader
        onClose={onClose}
        title={
          <Typography
            component="h2"
            color="text.primary"
            fontSize="20px"
            fontWeight={600}
          >
            Excluir aplicação
          </Typography>
        }
      />

      <Box sx={{ px: '4px', pb: '4px' }}>
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ mb: '12px', lineHeight: 1.6 }}
        >
          Tem certeza que deseja excluir esta aplicação?
        </Typography>
        <Typography
          color="text.primary"
          fontWeight={600}
          sx={{ mb: '16px', overflowWrap: 'anywhere', lineHeight: 1.5 }}
        >
          {formApplication.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: '24px', lineHeight: 1.6 }}
        >
          As respostas serão preservadas no banco de dados. A aplicação deixará
          de aparecer na listagem.
        </Typography>

        <SFlex gap={4} justifyContent="flex-end" flexWrap="wrap">
          <SButton
            text="Cancelar"
            variant="outlined"
            color="normal"
            schema={{
              color: 'text.primary',
              borderColor: 'divider',
              backgroundColor: 'transparent',
            }}
            onClick={onClose}
            disabled={isPending}
          />
          <SButton
            text="Excluir"
            variant="outlined"
            color="danger"
            schema={{
              color: dangerColor,
              borderColor: dangerColor,
              backgroundColor: 'transparent',
            }}
            onClick={handleConfirm}
            loading={isPending}
            disabled={isPending}
          />
        </SFlex>
      </Box>
    </SModalPaper>
  );
};
