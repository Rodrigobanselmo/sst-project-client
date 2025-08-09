import { Box, Typography } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { FormQuestionReadModel } from '@v2/models/form/models/shared/form-question-read.model';
import { FormAnswerFieldControlled } from '@v2/pages/companies/forms/pages/application/pages/public/answer/components/FormAnswerField/FormAnswerFieldControlled';
import { useMutateSubmitFormAnswer } from '@v2/services/forms/form-answer/submit-form-answer/hooks/useMutateSubmitFormAnswer';
import { useFetchPublicFormApplication } from '@v2/services/forms/form-application/public-form-application/hooks/useFetchPublicFormApplication';
import { STBoxLoading, STLoadLogoSimpleIcon } from 'layouts/default/loading/styles';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormAccessDenied } from './components/FormAccessDenied/FormAccessDenied';
import { HtmlContentRenderer } from './components/HtmlContentRenderer/FormAnswerFieldControlled';

interface FormAnswers {
  [questionId: string]: any;
}

export const PublicFormAnswerPage = ({ testingOnly }: { testingOnly?: boolean }) => {
  const router = useRouter();
  const applicationId = router.query.id as string;
  const [currentStep, setCurrentStep] = useState(0);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { publicFormApplication, isPublic, isTesting, isLoading } = useFetchPublicFormApplication({
    applicationId: applicationId,
  });

  const getCanAccess =   () => {
    if (testingOnly) {
      return isTesting;
    }
    return isPublic;
  }

  const submitMutation = useMutateSubmitFormAnswer();

  const form = useForm<FormAnswers>({
    defaultValues: {},
  });


  const totalSteps = publicFormApplication?.groups?.length || 0;
  const currentGroup = publicFormApplication?.groups?.[currentStep];
  const canAccess = getCanAccess();

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormAnswers) => {
    form.clearErrors();

    // Validate required fields for current group only
    const currentGroupQuestions = currentGroup?.questions || [];
    const requiredQuestions = currentGroupQuestions.filter(
      (question) => question.required,
    );

    const missingRequiredFields: string[] = [];

    requiredQuestions.forEach((question) => {
      const value = data[question.id];
      if (
        !value ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        missingRequiredFields.push(question.details.text || question.id);
        form.setError(question.id, {
          message: 'Este campo é obrigatório',
        });
      }
    });

    if (missingRequiredFields.length > 0) {
      form.setError('root', {
        message: `Campos obrigatórios não preenchidos: ${missingRequiredFields.join(', ')}`,
      });
      return;
    }

    // If this is the last step, submit the form
    if (currentStep === totalSteps - 1) {
      const answersArray = Object.entries(data).map(([questionId, value]) => ({
        questionId,
        value,
      }));

      try {
        await submitMutation.mutateAsync({
          applicationId: applicationId as string,
          answers: answersArray,
        });

        // Show thank you page
        setIsFormSubmitted(true);
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error('Error submitting form:', error);
        form.setError('root', {
          message: 'Erro ao enviar formulário. Tente novamente.',
        });
      }
    } else {
      // Move to next step
      handleNext();
    }
  };

  const handleSubmit = form.handleSubmit(onSubmit);

  if (isLoading) {
    return (
      <Box sx={{ height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <STBoxLoading>
          <STLoadLogoSimpleIcon />
        </STBoxLoading>
      </Box>
    );
  }

  if (!canAccess) {
    return <FormAccessDenied />;
  }

  if (!publicFormApplication) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Formulário não encontrado
      </div>
    );
  }

  // Show thank you page after successful submission
  if (isFormSubmitted) {
    return (
      <Box sx={{ backgroundColor: 'gray.100', height: '100vh', overflow: 'auto' }}>
        <Box style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          <Box
            sx={{
              backgroundColor: '#ffffff',
              padding: 12,
              borderRadius: 1,
              marginBottom: 2,
              borderTop: '4px solid #4caf50',
              textAlign: 'center',
            }}
          >
            <Box sx={{ marginBottom: 8 }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: 48,
                  color: '#4caf50',
                  marginBottom: 4,
                }}
              >
                ✓
              </Typography>
              <SText
                variant="h1"
                fontSize={28}
                sx={{
                  color: '#333',
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Obrigado!
              </SText>
              <SText
                fontSize={16}
                sx={{
                  color: '#666',
                  marginBottom: 12,
                  lineHeight: 1.6,
                }}
              >
                Seu formulário foi enviado com sucesso. Agradecemos por dedicar seu tempo para responder às nossas perguntas.
              </SText>
              <SText
                fontSize={14}
                sx={{
                  color: '#888',
                  fontStyle: 'italic',
                }}
              >
                Você pode fechar esta página agora.
              </SText>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  const sectionTitle =
    currentStep === 0
      ? currentGroup?.name || publicFormApplication.name
      : publicFormApplication.name;

  return (
    <Box ref={scrollContainerRef} sx={{ backgroundColor: 'gray.100', height: '100vh', overflow: 'auto' }}>
      <Box style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <SForm form={form}>
          <SFlex direction="column" gap={10}>
            {currentGroup && (
              <Box
                sx={{
                  backgroundColor: '#ffffff',
                  padding: 12,
                  borderRadius: 1,
                  marginBottom: 2,
                  borderTop: '4px solid #1976d2',
                }}
              >
                {isTesting && (
                  <Box
                    sx={{
                      backgroundColor: '#fff3cd',
                      border: '1px solid #ffeaa7',
                      borderRadius: 1,
                      padding: 4,
                      marginBottom: 8,
                    }}
                  >
                    <SText
                      color="warning.main"
                      fontSize={14}
                      sx={{ fontWeight: 600 }}
                    >
                      🧪 Modo de Teste - Este formulário está em modo de teste
                    </SText>
                  </Box>
                )}
                <SText
                  variant="h1"
                  fontSize={24}
                  sx={{
                    color: '#333',
                    fontWeight: 600,
                    marginBottom: 12,
                  }}
                >
                  {sectionTitle}
                </SText>
                {currentGroup.description && (
                  <HtmlContentRenderer
                    content={currentGroup.description}
                    fontSize={14}
                  />
                )}
              </Box>
            )}

            {currentGroup?.questions.map((question: FormQuestionReadModel) => {
              const fieldError = form.formState.errors[question.id];
              
              return (
                <Box
                  key={question.id}
                  sx={{
                    backgroundColor: '#ffffff',
                    padding: 12,
                    borderRadius: 2,
                    position: 'relative',
                    border: fieldError ? '1px solid' : 'none',
                    borderColor: fieldError ? 'error.main' : 'transparent',
                  }}
                >
                      {question.required && (
                    <SText
                      color="error.main"
                      fontSize={18}
                      sx={{position: 'absolute', top: 15, right: 15}}
                    >
                      * 
                    </SText>
                  )}
                  <HtmlContentRenderer content={question.details.text} mb={6} />
                  <FormAnswerFieldControlled 
                    question={question} 
                    name={question.id} 
                  />
                </Box>
              );
            })}

            {/* Navigation buttons */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 3,
                gap: 2,
              }}
            >
              <SButton
                onClick={handlePrevious}
                disabled={currentStep === 0}
                text="Anterior"
                color="normal"
                minWidth={120}
              />

              <SButton
                onClick={handleSubmit}
                loading={submitMutation.isPending}
                disabled={submitMutation.isPending}
                text={
                  currentStep === totalSteps - 1 ? 'Enviar Resposta' : 'Próximo'
                }
                color="primary"
                minWidth={120}
              />
            </Box>

            {/* Step indicator text */}
            <Box sx={{ textAlign: 'center', marginTop: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Passo {currentStep + 1} de {totalSteps}
              </Typography>
            </Box>
          </SFlex>
        </SForm>
      </Box>
    </Box>
  );
};
