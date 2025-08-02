import { Box, Typography } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { FormQuestionReadModel } from '@v2/models/form/models/shared/form-question-read.model';
import { FormAnswerFieldControlled } from '@v2/pages/companies/forms/pages/application/pages/public/answer/components/FormAnswerField/FormAnswerFieldControlled';
import { useMutateSubmitFormAnswer } from '@v2/services/forms/form-answer/submit-form-answer/hooks/useMutateSubmitFormAnswer';
import { useFetchPublicFormApplication } from '@v2/services/forms/form-application/public-form-application/hooks/useFetchPublicFormApplication';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { HtmlContentRenderer } from './components/HtmlContentRenderer/FormAnswerFieldControlled';

interface FormAnswers {
  [questionId: string]: any;
}

export const PublicFormAnswerPage = () => {
  const router = useRouter();
  const applicationId = router.query.id as string;
  const [currentStep, setCurrentStep] = useState(0);

  const { publicFormApplication, isPublic, isLoading } = useFetchPublicFormApplication({
    applicationId: applicationId,
  });

  const submitMutation = useMutateSubmitFormAnswer();

  const form = useForm<FormAnswers>({
    defaultValues: {},
  });

  const totalSteps = publicFormApplication?.groups?.length || 0;
  const currentGroup = publicFormApplication?.groups?.[currentStep];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
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

        // Redirect to success page or show success message
        alert('Formulário enviado com sucesso!');
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
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Carregando formulário...
      </div>
    );
  }

  if (!isPublic) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Formulário não está disponível para responder
      </div>
    );
  }

  if (!publicFormApplication) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Formulário não encontrado
      </div>
    );
  }

  const sectionTitle =
    currentStep === 0
      ? currentGroup?.name || publicFormApplication.name
      : publicFormApplication.name;

  return (
    <Box sx={{ backgroundColor: 'gray.100', height: '100vh', overflow: 'auto' }}>
      <Box style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 3,
            gap: 1,
          }}
        ></Box>

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
                <Typography
                  variant="h1"
                  fontSize={24}
                  sx={{
                    color: '#333',
                    fontWeight: 600,
                    marginBottom: 12,
                  }}
                >
                  {sectionTitle}
                </Typography>
                {currentGroup.description && (
                  <HtmlContentRenderer
                    content={currentGroup.description}
                    fontSize={14}
                  />
                )}
              </Box>
            )}

            {/* Current group questions */}
            {currentGroup?.questions.map((question: FormQuestionReadModel) => (
              <Box
                key={question.id}
                sx={{
                  backgroundColor: '#ffffff',
                  padding: 12,
                  borderRadius: 2,
                }}
              >
                <HtmlContentRenderer content={question.details.text} />
                <FormAnswerFieldControlled question={question} name={question.id} />
                {question.required && (
                  <Typography
                    color="text.secondary"
                    fontSize={12}
                    sx={{ mt: 0.5, fontStyle: 'italic' }}
                  >
                    * Campo obrigatório
                  </Typography>
                )}
              </Box>
            ))}

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
