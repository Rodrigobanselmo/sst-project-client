import { Box } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SDatePickerForm } from '@v2/components/forms/controlled/SDatePickerForm/SDatePickerForm';
import { SInputForm } from '@v2/components/forms/controlled/SInputForm/SInputForm';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { PageRoutes } from '@v2/constants/pages/routes';
import { useAppRouter } from '@v2/hooks/useAppRouter';
import { useMutatePublicFormApplicationLogin } from '@v2/services/forms/form-application/public-form-application-login/hooks/useMutatePublicFormApplicationLogin';
import { extractApiError } from '@v2/utils/extract-api-error';
import { cpfMask } from 'core/utils/masks/cpf.mask';
import { dateMask } from 'core/utils/masks/date.mask';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

interface LoginFormData {
  cpf: string;
  birthday: Date;
}

export const PublicFormLoginPage = ({ testingOnly }: { testingOnly?: boolean }) => {
   const router = useAppRouter();
  const applicationId = router.params.id as string;

  const loginMutation = useMutatePublicFormApplicationLogin();

  const form = useForm<LoginFormData>({
    defaultValues: {
      cpf: '',
      birthday: undefined,
    },
  });


  // Convert DD/MM/YYYY to YYYY-MM-DD
  const convertDateToISO = (date?: Date) => {
    if (!date) return undefined;

    const day = String(date.getDate());
    const month = String(date.getMonth() + 1);
    const year = date.getFullYear();

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const onSubmit = async (data: LoginFormData) => {
    form.clearErrors();

    // Validate required fields
    if (!data.cpf || !data.birthday) {
      if (!data.cpf) {
        form.setError('cpf', {
          message: 'CPF é obrigatório',
        });
      }
      if (!data.birthday) {
        form.setError('birthday', {
          message: 'Data de nascimento é obrigatória',
        });
      }
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({
        applicationId: applicationId as string,
        cpf: cpfMask.unmask(data.cpf),
        birthday: convertDateToISO(data.birthday) || '',
      });

      // Redirect to form with encrypted token
      router.push(PageRoutes.FORMS.PUBLIC_FORM_ANSWER.NORMAL + `?encrypt=${result.token}`, {
          pathParams: { id: applicationId },
      });
    } catch (error) {
      console.error('Error during login:', error);
      form.setError('root', {
        message: extractApiError(error as any),
      });
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: 'gray.100',
        height: '100vh',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box style={{ maxWidth: '500px', width: '100%', margin: '0 auto', padding: '20px' }}>
        <SForm form={form}>
          <SFlex direction="column" gap={10}>
            <Box
              sx={{
                backgroundColor: '#ffffff',
                padding: 12,
                borderRadius: 1,
                borderTop: '4px solid #1976d2',
                textAlign: 'center',
              }}
            >
              <SText
                variant="h1"
                fontSize={28}
                sx={{
                  color: '#333',
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Acesso ao Formulário
              </SText>
              
              <SText
                fontSize={14}
                sx={{
                  color: '#888',
                  marginBottom: 16,
                }}
              >
                Para acessar o formulário, informe seu CPF e data de nascimento
              </SText>
            </Box>

            {/* Login Form Fields */}
            <Box
              sx={{
                backgroundColor: '#ffffff',
                padding: 12,
                borderRadius: 2,
              }}
            >
              <SFlex direction="column" gap={8}>
                <SInputForm
                  name="cpf"
                  label="CPF"
                  placeholder="000.000.000-00"
                  fullWidth
                  transformation={(value: string) => cpfMask.mask(value)}
                />

                <SDatePickerForm
                  boxProps={{ flex: 1 }}
                  label="Data de Nascimento"
                  name="birthday"
                  autoFocus={false}
                  minDate={dayjs('1900-01-01')}
                  maxDate={dayjs()}
                />
              </SFlex>
            </Box>

            {/* Error message display */}
            {form.formState.errors.root && (
              <Box
                sx={{
                  backgroundColor: '#ffebee',
                  border: '1px solid #f44336',
                  borderRadius: 1,
                  padding: 3,
                }}
              >
                <SText
                  color="error.main"
                  fontSize={14}
                  sx={{ fontWeight: 600 }}
                >
                  {form.formState.errors.root.message}
                </SText>
              </Box>
            )}

            {/* Login Button */}
            <Box sx={{ textAlign: 'center' }}>
              <SButton
                onClick={form.handleSubmit(onSubmit)}
                loading={loginMutation.isPending}
                disabled={loginMutation.isPending}
                text="Acessar Formulário"
                color="primary"
                minWidth={200}
              />
            </Box>

            {/* Help Text */}
            <Box sx={{ textAlign: 'center', marginTop: 2 }}>
              <SText
                fontSize={12}
                sx={{
                  color: '#888',
                  fontStyle: 'italic',
                }}
              >
                Se você não conseguir acessar, entre em contato com o administrador
              </SText>
            </Box>
          </SFlex>
        </SForm>
      </Box>
    </Box>
  );
};
