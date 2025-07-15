import { useFormContext, useWatch } from 'react-hook-form';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { SInputForm } from '@v2/components/forms/controlled/SInputForm/SInputForm';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import { SDatePickerForm } from '@v2/components/forms/controlled/SDatePickerForm/SDatePickerForm';
import { SSelectForm } from '@v2/components/forms/controlled/SSelectForm/SSelectForm';
import { QuestionOptionsManager } from '../QuestionOptionsManager/QuestionOptionsManager';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';

interface QuestionTypeFormContentProps {
  sectionIndex: number;
  questionIndex: number;
}

export const QuestionTypeFormContent = ({
  sectionIndex,
  questionIndex,
}: QuestionTypeFormContentProps) => {
  const { control } = useFormContext();

  // Watch the question type to determine which form content to show
  const questionTypeValue = useWatch({
    control,
    name: `sections.${sectionIndex}.items.${questionIndex}.type`,
  });

  // Extract the value from the option object if it's an object
  const questionType =
    typeof questionTypeValue === 'object' && questionTypeValue?.value
      ? questionTypeValue.value
      : questionTypeValue;

  const renderFormContent = () => {
    switch (questionType) {
      case FormQuestionTypeEnum.SHORT_TEXT:
        return (
          <SInputForm
            name={`sections.${sectionIndex}.items.${questionIndex}.placeholder`}
            label="Placeholder"
            placeholder="Digite o placeholder da pergunta..."
          />
        );

      case FormQuestionTypeEnum.LONG_TEXT:
        return (
          <SInputMultilineForm
            name={`sections.${sectionIndex}.items.${questionIndex}.placeholder`}
            label="Placeholder"
            placeholder="Digite o placeholder da pergunta..."
            inputProps={{ minRows: 3, maxRows: 6 }}
          />
        );

      case FormQuestionTypeEnum.NUMBER:
        return (
          <SFlex flexDirection="column" gap={3}>
            <SInputForm
              name={`sections.${sectionIndex}.items.${questionIndex}.placeholder`}
              label="Placeholder"
              placeholder="Digite o placeholder da pergunta..."
            />
            <SFlex gap={3}>
              <SInputForm
                name={`sections.${sectionIndex}.items.${questionIndex}.minValue`}
                label="Valor mínimo"
                placeholder="0"
                inputProps={{ type: 'number' }}
              />
              <SInputForm
                name={`sections.${sectionIndex}.items.${questionIndex}.maxValue`}
                label="Valor máximo"
                placeholder="100"
                inputProps={{ type: 'number' }}
              />
            </SFlex>
          </SFlex>
        );

      case FormQuestionTypeEnum.DATE:
        return (
          <SDatePickerForm
            name={`sections.${sectionIndex}.items.${questionIndex}.defaultValue`}
            label="Data padrão (opcional)"
          />
        );

      case FormQuestionTypeEnum.FREQUENCY:
      case FormQuestionTypeEnum.INTENSITY:
        return (
          <SSelectForm
            name={`sections.${sectionIndex}.items.${questionIndex}.scale`}
            label="Escala"
            options={[
              { label: '1-5', value: '1-5' },
              { label: '1-10', value: '1-10' },
              { label: '0-100', value: '0-100' },
            ]}
            getOptionLabel={(option) => option.label}
            getOptionValue={(option) => option.value}
          />
        );

      case FormQuestionTypeEnum.RADIO:
      case FormQuestionTypeEnum.CHECKBOX:
      case FormQuestionTypeEnum.SELECT:
        return (
          <QuestionOptionsManager
            sectionIndex={sectionIndex}
            questionIndex={questionIndex}
          />
        );

      case FormQuestionTypeEnum.TEXT:
      default:
        return (
          <SInputMultilineForm
            name={`sections.${sectionIndex}.items.${questionIndex}.placeholder`}
            label="Placeholder"
            placeholder="Digite o placeholder da pergunta..."
            inputProps={{ minRows: 2, maxRows: 4 }}
          />
        );
    }
  };

  if (!questionType) {
    return (
      <div
        style={{
          padding: '16px',
          textAlign: 'center',
          color: '#666',
          fontStyle: 'italic',
        }}
      >
        Selecione um tipo de pergunta para configurar as opções
      </div>
    );
  }

  return (
    <SFlex flexDirection="column" gap={4}>
      {renderFormContent()}
    </SFlex>
  );
};
