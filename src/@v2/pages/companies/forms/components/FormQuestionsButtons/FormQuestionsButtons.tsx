import { Box, Typography } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { getSaveActionV2Color } from 'core/utils/save-action-color';
import { FieldErrors } from 'react-hook-form';
import { IFormModelForms } from '../../pages/model/schemas/form-model.schema';

export const FormQuestionsButtons = ({
  onSubmit,
  onSubmitAndExit,
  onCancel,
  errors,
  loading = false,
  isDirty,
  showSaveAndExit = false,
}: {
  onSubmit: () => Promise<void> | void;
  onSubmitAndExit?: () => Promise<void> | void;
  onCancel: () => void;
  errors: FieldErrors<IFormModelForms> | FieldErrors<Record<string, unknown>>;
  loading?: boolean;
  isDirty?: boolean;
  showSaveAndExit?: boolean;
}) => {
  const { showConfirmation } = useConfirmationModal();
  const saveActionColor = getSaveActionV2Color(!!isDirty);

  const handleCancel = async () => {
    if (isDirty === false) {
      onCancel();
      return;
    }

    const confirmed = await showConfirmation({
      title: 'Cancelar Formulário',
      message:
        'Tem certeza que deseja cancelar? Todas as alterações serão perdidas.',
      confirmText: 'Sim, Cancelar',
      cancelText: 'Continuar Editando',
      variant: 'warning',
    });

    if (confirmed) {
      onCancel();
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div>
      {hasErrors && (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'schema.red',
            backgroundColor: 'schema.redFade',
            p: 3,
            borderRadius: 1,
            my: 8,
          }}
        >
          <Typography color="error.dark" fontSize={14} fontWeight={600} mb={1}>
            Erro de Validação
          </Typography>
          <Typography color="error.dark" fontSize={13} mb={2}>
            Alguns campos estão faltando ou incorretos. Verifique os erros
            destacados no formulário.
          </Typography>

          <Box>
            {Object.entries(errors).map(([fieldPath, error]) => (
              <Typography
                key={fieldPath}
                color="error.dark"
                fontSize={12}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 0.5,
                }}
              >
                <span>•</span>
                <span>
                  {fieldPath.includes('options')
                    ? 'Opção sem label válido'
                    : error?.message || 'Campo inválido'}
                </span>
              </Typography>
            ))}
          </Box>
        </Box>
      )}

      <SFlex justifyContent="flex-end" gap={3} mt={6} flexWrap="wrap">
        <SButton
          text="Cancelar"
          onClick={handleCancel}
          color="danger"
          variant="shade"
          size="m"
          buttonProps={{
            sx: {
              ml: 'auto',
              minWidth: '140px',
            },
          }}
        />
        <SButton
          text={loading ? 'Salvando...' : 'Salvar'}
          onClick={onSubmit}
          color={showSaveAndExit ? saveActionColor : 'primary'}
          variant={showSaveAndExit ? 'outlined' : 'contained'}
          size="m"
          loading={loading}
          disabled={loading}
          buttonProps={{
            sx: {
              minWidth: '140px',
            },
          }}
        />
        {showSaveAndExit && (
          <SButton
            text={loading ? 'Salvando...' : 'Salvar e sair'}
            onClick={onSubmitAndExit}
            color={saveActionColor}
            variant="contained"
            size="m"
            loading={loading}
            disabled={loading}
            buttonProps={{
              sx: {
                minWidth: '140px',
              },
            }}
          />
        )}
      </SFlex>
    </div>
  );
};
