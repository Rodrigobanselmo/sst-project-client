import { InputAdornment } from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { SAccordionBody } from '@v2/components/organisms/SAccordion/components/SAccordionBody/SAccordionBody';
import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import {
  FormQuestionOption,
  SFormQuestionAccordionBody,
} from './components/SFormQuestionAccordionBody/SFormQuestionAccordionBody';
import { SFormQuestionAccordionButtons } from './components/SFormQuestionAccordionButtons/SFormQuestionAccordionButtons';

interface SFormQuestionAccordionProps {
  sectionIndex: number;
  questionIndex: number;
  questionNumber: number;
  typeOptions: FormQuestionOption[];
  isFocused?: boolean;
  onCopy?: () => void;
  onDelete?: () => void;
  onAddNewSection?: () => void;
  onAddNewQuestion: () => void;
  disableQuestionDuplication?: boolean;
  disableQuestionCreation?: boolean;
  disableRequiredSwitch?: boolean;
}

export const SFormQuestionAccordion = ({
  sectionIndex,
  questionIndex,
  questionNumber,
  typeOptions,
  isFocused = false,
  onCopy,
  onDelete,
  onAddNewSection,
  onAddNewQuestion,
  disableQuestionDuplication = false,
  disableQuestionCreation = false,
  disableRequiredSwitch = false,
}: SFormQuestionAccordionProps) => {
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
          <SSearchSelectForm
            boxProps={{
              sx: {
                ml: 'auto',
              },
            }}
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
        }
        title={`Pergunta ${questionNumber}`}
      >
        <SAccordionBody>
          <SFormQuestionAccordionBody
            sectionIndex={sectionIndex}
            questionIndex={questionIndex}
            onCopy={disableQuestionDuplication ? undefined : onCopy}
            onDelete={onDelete}
            disableRequiredSwitch={disableRequiredSwitch}
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
