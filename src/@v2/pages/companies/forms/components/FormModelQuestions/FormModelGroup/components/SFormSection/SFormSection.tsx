import { Box, Stack } from '@mui/material';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { SFormQuestionAccordion } from '../SFormQuestionAccordion/SFormQuestionAccordion';
import { SFormSectionHeader } from './components/SFormSectionHeader/SFormSectionHeader';
import { getFormModelInitialValues } from '../../../../../pages/model/schemas/form-model.schema';
import { v4 } from 'uuid';
import { FormQuestionOption } from '../SFormQuestionAccordion/components/SFormQuestionAccordionBody/SFormQuestionAccordionBody';

interface SFormSectionProps {
  sectionIndex: number;
  sectionNumber: number;
  onDeleteSection?: () => void;
  onAddNewSection?: (questionIndex: number) => void;
  onMinimizeSection?: () => void;
  isMinimized?: boolean;
  questionTypeOptions: FormQuestionOption[];
  title?: (index: number) => string;
  hideInputTitle?: boolean;
  descriptionPlaceholder?: string;
  initialValues: any;
}

export const SFormSection = ({
  sectionIndex,
  sectionNumber,
  onDeleteSection,
  onAddNewSection,
  onMinimizeSection,
  isMinimized = false,
  questionTypeOptions,
  title = (index) => `Seção ${index + 1}`,
  hideInputTitle = false,
  descriptionPlaceholder = 'Descrição da seção',
  initialValues,
}: SFormSectionProps) => {
  const { control, getValues } = useFormContext();
  const [focusedQuestionIndex, setFocusedQuestionIndex] = useState<
    number | null
  >(null);

  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.items`,
  });

  const handleAddNewSection = (questionIndex: number) => {
    onAddNewSection?.(questionIndex);
  };

  const handleAddNewQuestion = () => {
    append(initialValues);
  };

  const handleInsertNewQuestionFromQuestion = (index: number) => {
    insert(index + 1, initialValues);
  };

  const handleCopyQuestion = (questionIndex: number) => {
    const currentValues = getValues();
    const currentQuestion =
      currentValues.sections[sectionIndex].items[questionIndex];

    const newItem = {
      ...currentQuestion,
      id: v4(),
      apiId: undefined,
      options: currentQuestion.options?.map((option) => ({
        ...option,
        id: v4(),
        apiId: undefined,
      })),
    };

    insert(questionIndex + 1, newItem);
  };

  const handleDeleteQuestion = (questionIndex: number) => {
    if (fields.length === 1) {
      return;
    }
    remove(questionIndex);
  };

  const handleQuestionClick = (questionIndex: number) => {
    if (focusedQuestionIndex !== questionIndex) {
      setFocusedQuestionIndex(questionIndex);
    }
  };

  return (
    <SFormSectionHeader
      sectionIndex={sectionIndex}
      sectionNumber={sectionNumber}
      onDeleteSection={onDeleteSection}
      onAddNewQuestion={handleAddNewQuestion}
      onMinimizeSection={onMinimizeSection}
      isMinimized={isMinimized}
      title={title}
      hideInputTitle={hideInputTitle}
      descriptionPlaceholder={descriptionPlaceholder}
    >
      <Box>
        <Stack gap={4}>
          {fields.map((field, questionIndex) => (
            <div
              key={field.id}
              onClick={() => handleQuestionClick(questionIndex)}
            >
              <Box
                sx={{
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: 'translateY(0)',
                  opacity: 1,
                  animation:
                    'questionSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                  '@keyframes questionSlideIn': {
                    '0%': {
                      maxHeight: 0,
                      opacity: 0,
                      transform: 'translateY(-30px)',
                    },
                    '100%': {
                      maxHeight: '1000px',
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                <SFormQuestionAccordion
                  sectionIndex={sectionIndex}
                  questionIndex={questionIndex}
                  questionNumber={questionIndex + 1}
                  typeOptions={questionTypeOptions}
                  isFocused={focusedQuestionIndex === questionIndex}
                  onCopy={() => handleCopyQuestion(questionIndex)}
                  onDelete={() => handleDeleteQuestion(questionIndex)}
                  onAddNewSection={() => handleAddNewSection(questionIndex)}
                  onAddNewQuestion={() =>
                    handleInsertNewQuestionFromQuestion(questionIndex)
                  }
                />
              </Box>
            </div>
          ))}
        </Stack>
      </Box>
    </SFormSectionHeader>
  );
};
