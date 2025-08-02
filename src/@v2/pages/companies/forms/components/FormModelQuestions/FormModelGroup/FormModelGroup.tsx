import { Box, Stack } from '@mui/material';
import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { SFormQuestionSection } from './components/SFormSection/SFormSection';
import {
  getFormModelInitialValues,
  getFormSectionInitialValues,
} from '../../../pages/model/schemas/form-model.schema';
import { FormQuestionTypeMapList } from '../../../pages/model/constants/form-question-type-map';

export const FormModelGroup = ({ companyId }: { companyId: string }) => {
  const { control, getValues } = useFormContext();
  const [minimizedSections, setMinimizedSections] = useState<Set<number>>(
    new Set(),
  );
  const { fields, remove, replace } = useFieldArray({
    control,
    name: 'sections',
  });

  const handleDeleteSection = (index: number) => {
    if (fields.length === 1) {
      return;
    }
    remove(index);
  };

  const handleAddNewSectionFromQuestion = (
    currentSectionIndex: number,
    questionIndex: number,
  ) => {
    const scrollPosition = window.scrollY;

    const currentValues = getValues();
    const currentSection = currentValues.sections[currentSectionIndex];

    if (!currentSection || !currentSection.items) {
      return;
    }

    const newSection = getFormSectionInitialValues();

    const questionsToMove = currentSection.items.slice(questionIndex + 1);

    const updatedSections = [...currentValues.sections];

    updatedSections[currentSectionIndex] = {
      ...currentSection,
      items: currentSection.items.slice(0, questionIndex + 1),
    };

    const newSectionWithQuestions = {
      ...newSection,
      items: questionsToMove,
    };
    updatedSections.splice(currentSectionIndex + 1, 0, newSectionWithQuestions);

    replace(updatedSections);

    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPosition);
    });
  };

  const handleMinimizeSection = (sectionIndex: number) => {
    setMinimizedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionIndex)) {
        newSet.delete(sectionIndex);
      } else {
        newSet.add(sectionIndex);
      }
      return newSet;
    });
  };

  return (
    <Box>
      <Stack gap={16}>
        {fields.map((field, idx) => {
          return (
            <SFormQuestionSection
              key={field.id}
              initialValues={getFormModelInitialValues()}
              questionTypeOptions={FormQuestionTypeMapList}
              sectionIndex={idx}
              sectionNumber={idx + 1}
              onDeleteSection={() => handleDeleteSection(idx)}
              onAddNewSection={(questionIndex) =>
                handleAddNewSectionFromQuestion(idx, questionIndex)
              }
              onMinimizeSection={() => handleMinimizeSection(idx)}
              isMinimized={minimizedSections.has(idx)}
            />
          );
        })}
      </Stack>
    </Box>
  );
};
