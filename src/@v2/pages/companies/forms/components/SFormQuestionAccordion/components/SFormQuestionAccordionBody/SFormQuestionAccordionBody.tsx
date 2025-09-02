import { Divider } from '@mui/material';
import { SIconDelete } from '@v2/assets/icons';
import { SIconCopy } from '@v2/assets/icons/SIconCopy/SIconCopy';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SEditorForm } from '@v2/components/forms/controlled/SEditorForm/SEditorForm';
import { SSwitchForm } from '@v2/components/forms/controlled/SSwitchForm/SSwitchForm';
import { QuestionTypeFormContent } from './components/QuestionTypeFormContent/QuestionTypeFormContent';
import { FormRiskSelect } from './components/FormRiskSelect';

export interface FormQuestionOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface SFormQuestionAccordionProps {
  sectionIndex: number;
  questionIndex: number;
  onCopy?: () => void;
  onDelete?: () => void;
  disableRequiredSwitch?: boolean;
  companyId: string;
}

export const SFormQuestionAccordionBody = ({
  sectionIndex,
  questionIndex,
  onCopy,
  onDelete,
  disableRequiredSwitch = false,
  companyId,
}: SFormQuestionAccordionProps) => {
  return (
    <SFlex mt={8} flexDirection="column" gap={5}>
      <SEditorForm
        placeholder="Pergunta"
        name={`sections.${sectionIndex}.items.${questionIndex}.content`}
        editorContainerProps={{
          sx: {},
        }}
      />

      <QuestionTypeFormContent
        sectionIndex={sectionIndex}
        questionIndex={questionIndex}
      />

      <FormRiskSelect
        name={`sections.${sectionIndex}.items.${questionIndex}.risk`}
        companyId={companyId}
      />

      <Divider sx={{ mt: 4, mb: 0 }} />
      <SFlex alignItems="center" justifyContent="flex-end" gap={2}>
        {onCopy && (
          <SIconButton onClick={onCopy}>
            <SIconCopy color="grey.600" fontSize={20} />
          </SIconButton>
        )}
        <SIconButton onClick={onDelete}>
          <SIconDelete color="grey.600" fontSize={22} />
        </SIconButton>
        {(onCopy || !disableRequiredSwitch) && (
          <SDivider orientation="vertical" sx={{ mx: 4, ml: 2, height: 28 }} />
        )}

        {!disableRequiredSwitch && (
          <SSwitchForm
            name={`sections.${sectionIndex}.items.${questionIndex}.required`}
            label="Obrigatória"
            fontSize="14px"
          />
        )}
      </SFlex>
    </SFlex>
  );
};
