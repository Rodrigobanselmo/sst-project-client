import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import { Box, InputAdornment } from '@mui/material';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { SAccordionBody } from '@v2/components/organisms/SAccordion/components/SAccordionBody/SAccordionBody';
import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import {
  FormQuestionOption,
  SFormQuestionAccordionBody,
} from './components/SFormQuestionAccordionBody/SFormQuestionAccordionBody';
import { SFormQuestionAccordionButtons } from './components/SFormQuestionAccordionButtons/SFormQuestionAccordionButtons';
import { useFormContext, useWatch } from 'react-hook-form';
import { IFormModelForms } from '../../pages/model/schemas/form-model.schema';

interface SFormQuestionAccordionProps {
  sectionIndex: number;
  questionIndex: number;
  questionNumber: number;
  typeOptions: FormQuestionOption[];
  isFocused?: boolean;
  onMoveQuestionUp?: () => void;
  onMoveQuestionDown?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onAddNewSection?: () => void;
  onAddNewQuestion: () => void;
  disableQuestionDuplication?: boolean;
  disableQuestionCreation?: boolean;
  disableRequiredSwitch?: boolean;
  companyId: string;
}

export const SFormQuestionAccordion = ({
  sectionIndex,
  questionIndex,
  questionNumber,
  typeOptions,
  isFocused = false,
  onMoveQuestionUp,
  onMoveQuestionDown,
  onCopy,
  onDelete,
  onAddNewSection,
  onAddNewQuestion,
  disableQuestionDuplication = false,
  disableQuestionCreation = false,
  disableRequiredSwitch = false,
  companyId,
}: SFormQuestionAccordionProps) => {
  const { control } = useFormContext<IFormModelForms>();
  const disabledEdition = useWatch({
    control,
    name: `sections.${sectionIndex}.items.${questionIndex}.disabledEdition`,
  });

  return (
    <div style={{ position: 'relative' }}>
      <SAccordion
        expandIcon={null}
        expanded={true}
        onChange={() => {}}
        accordionProps={{
          sx: {
            borderLeft: isFocused ? '5px solid' : 'none',
            borderColor: isFocused ? 'info.light' : 'transparent',
          },
        }}
        endComponent={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              ml: 'auto',
            }}
          >
            {onMoveQuestionUp && (
              <SIconButton
                tooltip="Subir pergunta"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveQuestionUp();
                }}
                iconButtonProps={{ 'aria-label': 'Subir pergunta' }}
              >
                <KeyboardArrowUpOutlinedIcon
                  sx={{ color: 'grey.600', fontSize: 20 }}
                />
              </SIconButton>
            )}
            {onMoveQuestionDown && (
              <SIconButton
                tooltip="Descer pergunta"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveQuestionDown();
                }}
                iconButtonProps={{ 'aria-label': 'Descer pergunta' }}
              >
                <KeyboardArrowDownOutlinedIcon
                  sx={{ color: 'grey.600', fontSize: 20 }}
                />
              </SIconButton>
            )}
            <SSearchSelectForm
              boxProps={{
                sx: {
                  ml: 0,
                },
              }}
              disabled={disabledEdition}
              name={`sections.${sectionIndex}.items.${questionIndex}.type`}
              renderStartAdornment={({ option }) =>
                option ? (
                  <InputAdornment position="start">{option?.icon}</InputAdornment>
                ) : null
              }
              placeholder="Tipo"
              renderItem={(option) => (
                <SFlex alignItems="center" gap={2}>
                  {option.option.icon}
                  <span>{option.label}</span>
                </SFlex>
              )}
              options={typeOptions}
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
            />
          </Box>
        }
        title={`Pergunta ${questionNumber}`}
      >
        <SAccordionBody>
          <SFormQuestionAccordionBody
            sectionIndex={sectionIndex}
            questionIndex={questionIndex}
            onCopy={onCopy}
            onDelete={onDelete}
            disableQuestionDuplication={disableQuestionDuplication}
            disableRequiredSwitch={disableRequiredSwitch}
            companyId={companyId}
          />
        </SAccordionBody>
      </SAccordion>
      {isFocused && (
        <SFormQuestionAccordionButtons
          onAddNewSection={onAddNewSection}
          onAddNewQuestion={
            disableQuestionCreation ? undefined : onAddNewQuestion
          }
        />
      )}
    </div>
  );
};
