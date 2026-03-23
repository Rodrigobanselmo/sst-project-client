import { Box, Typography } from '@mui/material';
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
  const router = useAppRouter();
  const { mutate: softDelete, isPending } = useMutateSoftDeleteFormApplication();

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
    <SModalPaper center sx={{ maxWidth: 480, width: '90%' }}>
      <SModalHeader onClose={onClose} title="Excluir aplicação" />

      <Box sx={{ p: 6 }}>
        <Typography variant="body1" sx={{ mb: 6 }}>
          Tem certeza que deseja excluir a aplicação{' '}
          <strong>{formApplication.name}</strong>? Esta ação não remove as
          respostas do banco de dados, mas a aplicação deixará de aparecer na
          listagem.
        </Typography>

        <SFlex gap={4} justifyContent="flex-end" flexWrap="wrap">
          <SButton
            text="Cancelar"
            variant="outlined"
            color="normal"
            onClick={onClose}
            disabled={isPending}
          />
          <SButton
            text="Excluir"
            variant="contained"
            color="danger"
            onClick={handleConfirm}
            loading={isPending}
            disabled={isPending}
          />
        </SFlex>
      </Box>
    </SModalPaper>
  );
};
