import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import { Alert, Box, Button, Stack } from '@mui/material';
import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { v4 } from 'uuid';
import { FormQuestionOption } from '../SFormQuestionAccordion/components/SFormQuestionAccordionBody/SFormQuestionAccordionBody';
import { SFormQuestionAccordion } from '../SFormQuestionAccordion/SFormQuestionAccordion';
import { SFormSectionHeader } from './components/SFormSectionHeader/SFormSectionHeader';

interface SFormSectionProps {
  sectionIndex: number;
  sectionNumber: number;
  onDeleteSection?: () => void;
  onMoveSectionUp?: () => void;
  onMoveSectionDown?: () => void;
  onAddNewSection?: (questionIndex: number) => void;
  onMinimizeSection?: () => void;
  isMinimized?: boolean;
  questionTypeOptions: FormQuestionOption[];
  title?: (index: number) => string;
  hideInputTitle?: boolean;
  descriptionPlaceholder?: string;
  initialValues: any;
  disableQuestionDuplication?: boolean;
  disableQuestionCreation?: boolean;
  disableRequiredSwitch?: boolean;
  /** Abre o fluxo para copiar uma pergunta da Biblioteca de Perguntas Preliminares. */
  onAddFromLibrary?: () => void;
  /** Abre o fluxo para copiar um bloco (várias perguntas) da biblioteca. */
  onAddBlockFromLibrary?: () => void;
  /**
   * Quando true, a estrutura do questionário preliminar não pode mais ser alterada
   * (ex.: já existem respostas submetidas).
   */
  structureFrozen?: boolean;
  companyId: string;
}

export const SFormQuestionSection = ({
  sectionIndex,
  sectionNumber,
  onDeleteSection,
  onMoveSectionUp,
  onMoveSectionDown,
  onAddNewSection,
  onMinimizeSection,
  isMinimized = false,
  questionTypeOptions,
  title = (index) => `Seção ${index + 1}`,
  hideInputTitle = false,
  descriptionPlaceholder = 'Descrição da seção',
  initialValues,
  disableQuestionDuplication = false,
  disableQuestionCreation = false,
  disableRequiredSwitch = false,
  onAddFromLibrary,
  onAddBlockFromLibrary,
  structureFrozen = false,
  companyId,
}: SFormSectionProps) => {
  const { control, getValues } = useFormContext();
  const [focusedQuestionIndex, setFocusedQuestionIndex] = useState<
    number | null
  >(null);

  const { fields, append, remove, insert, move } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.items`,
  });

  const handleMoveQuestion = (fromIndex: number, direction: 'up' | 'down') => {
    if (structureFrozen) return;
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= fields.length) return;

    move(fromIndex, toIndex);

    setFocusedQuestionIndex((prev) => {
      if (prev === null) return prev;
      if (prev === fromIndex) return toIndex;
      if (prev === toIndex) return fromIndex;
      return prev;
    });
  };

  const handleAddNewQuestion = () => {
    if (structureFrozen) return;
    append(initialValues);
  };

  const handleInsertNewQuestionFromQuestion = (index: number) => {
    if (structureFrozen) return;
    insert(index + 1, initialValues);
  };

  const handleCopyQuestion = (questionIndex: number) => {
    if (structureFrozen) return;
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
    if (structureFrozen) return;
    if (fields.length === 1) {
      return;
    }
    remove(questionIndex);
  };

  const effectiveDisableCreation =
    disableQuestionCreation || structureFrozen;
  const effectiveDisableDuplication =
    disableQuestionDuplication || structureFrozen;
  const effectiveDisableRequired = disableRequiredSwitch || structureFrozen;

  const libraryFromLibrary = structureFrozen ? undefined : onAddFromLibrary;
  const blockFromLibrary = structureFrozen
    ? undefined
    : onAddBlockFromLibrary;

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
      onMoveSectionUp={onMoveSectionUp}
      onMoveSectionDown={onMoveSectionDown}
      onAddNewQuestion={
        effectiveDisableCreation ? undefined : handleAddNewQuestion
      }
      onAddFromLibrary={libraryFromLibrary}
      onAddBlockFromLibrary={blockFromLibrary}
      onMinimizeSection={onMinimizeSection}
      isMinimized={isMinimized}
      title={title}
      hideInputTitle={hideInputTitle}
      descriptionPlaceholder={descriptionPlaceholder}
    >
      <Box>
        {structureFrozen && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Este questionário já recebeu respostas. A estrutura das perguntas
            preliminares não pode mais ser alterada (incluir, remover, reordenar
            ou duplicar).
          </Alert>
        )}
        {(libraryFromLibrary || blockFromLibrary) && (
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {libraryFromLibrary && (
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<LibraryBooksOutlinedIcon />}
                onClick={libraryFromLibrary}
              >
                Adicionar da biblioteca
              </Button>
            )}
            {blockFromLibrary && (
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<ViewWeekOutlinedIcon />}
                onClick={blockFromLibrary}
              >
                Adicionar bloco da biblioteca
              </Button>
            )}
          </Box>
        )}
        <Stack gap={4}>
          {fields.map((field, questionIndex) => {
            return (
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
                    companyId={companyId}
                    sectionIndex={sectionIndex}
                    questionIndex={questionIndex}
                    questionNumber={questionIndex + 1}
                    typeOptions={questionTypeOptions}
                    isFocused={focusedQuestionIndex === questionIndex}
                    onMoveQuestionUp={
                      !structureFrozen && questionIndex > 0
                        ? () => handleMoveQuestion(questionIndex, 'up')
                        : undefined
                    }
                    onMoveQuestionDown={
                      !structureFrozen &&
                      questionIndex < fields.length - 1
                        ? () => handleMoveQuestion(questionIndex, 'down')
                        : undefined
                    }
                    onCopy={
                      structureFrozen
                        ? undefined
                        : () => handleCopyQuestion(questionIndex)
                    }
                    onDelete={
                      structureFrozen
                        ? undefined
                        : () => handleDeleteQuestion(questionIndex)
                    }
                    onAddNewSection={
                      onAddNewSection
                        ? () => onAddNewSection(questionIndex)
                        : undefined
                    }
                    onAddNewQuestion={() =>
                      handleInsertNewQuestionFromQuestion(questionIndex)
                    }
                    disableQuestionDuplication={effectiveDisableDuplication}
                    disableQuestionCreation={effectiveDisableCreation}
                    disableRequiredSwitch={effectiveDisableRequired}
                    structureFrozen={structureFrozen}
                  />
                </Box>
              </div>
            );
          })}
        </Stack>
      </Box>
    </SFormSectionHeader>
  );
};
