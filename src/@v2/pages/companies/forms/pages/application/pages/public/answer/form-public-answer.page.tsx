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
import { useRef, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useActiveTimeTracker } from '@v2/hooks/useActiveTimeTracker';
import { FormAccessDenied } from './components/FormAccessDenied/FormAccessDenied';
import { HtmlContentRenderer } from './components/HtmlContentRenderer/FormAnswerFieldControlled';
import { FormQuestionOptionReadModel } from '@v2/models/form/models/shared/form-question-option-read.model';
import { FormAnswerData } from '@v2/services/forms/form-answer/submit-form-answer/service/submit-form-answer.service';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { FormIdentifierTypeEnum } from '@v2/models/form/enums/form-identifier-type.enum';

interface FormAnswers {
  [questionId: string]: FormQuestionOptionReadModel | string;
}

const VALIDATE_STRING_REQUIRED_FIELDS = [FormQuestionTypeEnum.SHORT_TEXT, FormQuestionTypeEnum.LONG_TEXT];
const VALIDATE_SYSTEM_REQUIRED_FIELDS = [FormIdentifierTypeEnum.SECTOR];

export const PublicFormAnswerPage = ({ testingOnly }: { testingOnly?: boolean }) => {
  const router = useRouter();
  const applicationId = router.query.id as string;
  const [currentStep, setCurrentStep] = useState(0);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize active time tracker
  const timeTracker = useActiveTimeTracker({
    inactivityThreshold: 30000, // 30 seconds of inactivity
    autoStart: true,
  });

  const { publicFormApplication, options, isPublic, isTesting, isLoading } = useFetchPublicFormApplication({
    applicationId: applicationId,
  });

  const getCanAccess =   () => {
    if (testingOnly) {
      return isTesting;
    }
    return isPublic;
  };

  const submitMutation = useMutateSubmitFormAnswer();

  const form = useForm<FormAnswers>({
    defaultValues: {},
  });


  const totalSteps = publicFormApplication?.groups?.length || 0;
  const currentGroup = publicFormApplication?.groups?.[currentStep];
  const canAccess = getCanAccess();

  const scrollToFirstError = useCallback(() => {
    // Get the first error field
    const errors = form.formState.errors;
    const firstErrorField = Object.keys(errors).find(key => key !== 'root');

    if (firstErrorField) {
      // Find the element with the error field ID
      const errorElement = document.getElementById(`question-${firstErrorField}`);
      if (errorElement && scrollContainerRef.current) {
        // Calculate the position to scroll to (with some offset for better visibility)
        const elementTop = errorElement.offsetTop;
        const offset = 100; // Offset from top for better visibility

        scrollContainerRef.current.scrollTo({
          top: elementTop - offset,
          behavior: 'smooth'
        });
      }
    }
  }, [form.formState.errors]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      form.clearErrors();
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async () => {
    const data = form.getValues();
    form.clearErrors();

    // Validate required fields for current group only
    const currentGroupQuestions = currentGroup?.questions || [];
    const requiredQuestions = currentGroupQuestions.filter(
      (question) => question.required,
    );

    console.log({data, requiredQuestions});

    const missingRequiredFields: string[] = [];

    const allQuestions = publicFormApplication?.groups
          ?.flatMap(group => group.questions) || [];

    requiredQuestions.forEach((question) => {
      const fieldValue = data[question.id];
      let isError = false;

      if (VALIDATE_STRING_REQUIRED_FIELDS.includes(question.details.type)) {
        isError = !fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '');
      } else {
        isError = !fieldValue || (typeof fieldValue === 'object' && !fieldValue.id);
      }

      if (isError) {
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

      // Scroll to the first error field after a short delay to ensure errors are set
      setTimeout(() => {
        scrollToFirstError();
      }, 100);

      return;
    }

    // If this is the last step, submit the form
    if (currentStep === totalSteps - 1) {
      const answersArray = Object.entries(data).map<FormAnswerData>(([questionId, value]) => {
        const question = allQuestions?.find(q => q.id === questionId);

        if (!question?.details.type) {
          return { questionId, value: undefined };
        }
        if (VALIDATE_SYSTEM_REQUIRED_FIELDS.includes(question.details.identifierType)) {
          return {
            questionId,
            value: (typeof value === 'object' && value?.id) ? value.id : undefined,
          };
        }else if (VALIDATE_STRING_REQUIRED_FIELDS.includes(question.details.type)) {
          return {
            questionId,
            value: typeof value === 'string' ? value : undefined,
          };
        } else {
          return {
            questionId,
            optionIds: (typeof value === 'object' && value?.id) ? [value.id] : undefined,
          };
        }
      });

      try {
        // Stop time tracking and get final time
        const totalTimeSpent = timeTracker.getActiveTimeInSeconds();
        timeTracker.stop();

        await submitMutation.mutateAsync({
          applicationId: applicationId as string,
          answers: answersArray,
          timeSpent: totalTimeSpent,
        });

        // Show thank you page
        setIsFormSubmitted(true);
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error('Error submitting form:', error);
        form.setError('root', {
          message: 'Erro ao enviar formulário. Tente novamente.',
        });

        // Scroll to top to show the error message
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Move to next step
      handleNext();
    }
  };

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
    currentStep !== 0
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
                  id={`question-${question.id}`}
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
                    options={options}
                  />
                </Box>
              );
            })}

            {/* Error message display */}
            {form.formState.errors.root && (
              <Box
                sx={{
                  backgroundColor: '#ffebee',
                  border: '1px solid #f44336',
                  borderRadius: 1,
                  padding: 3,
                  marginTop: 2,
                }}
              >
                <SText
                  color="error.main"
                  fontSize={14}
                  sx={{ fontWeight: 600 }}
                >
                  Campos obrigatórios não preenchidos ou preenchidos incorretamente.
                </SText>
              </Box>
            )}

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
                onClick={onSubmit}
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
