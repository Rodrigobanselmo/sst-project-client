import { Box, Stack } from '@mui/material';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { FormQuestionTypeMapList } from '../../../../maps/form-question-type-map';
import { getFormModelInitialValues } from '../../../FormModelAddContent/FormModelAddContent.schema';
import { SFormQuestionAccordion } from '../SFormQuestionAccordion/SFormQuestionAccordion';
import { SFormSectionHeader } from './components/SFormSectionHeader/SFormSectionHeader';

interface SFormSectionProps {
  sectionIndex: number;
  sectionNumber: number;
  onDeleteSection?: () => void;
  onAddNewSection?: (questionIndex: number) => void;
  onMinimizeSection?: () => void;
  isMinimized?: boolean;
}

export const SFormSection = ({
  sectionIndex,
  sectionNumber,
  onDeleteSection,
  onAddNewSection,
  onMinimizeSection,
  isMinimized = false,
}: SFormSectionProps) => {
  const { control } = useFormContext();
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
    append(getFormModelInitialValues());
  };

  const handleInsertNewQuestionFromQuestion = (index: number) => {
    insert(index + 1, getFormModelInitialValues());
  };

  const handleCopyQuestion = (questionIndex: number) => {
    const newItem = { ...fields[questionIndex] };
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
                  typeOptions={FormQuestionTypeMapList}
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
