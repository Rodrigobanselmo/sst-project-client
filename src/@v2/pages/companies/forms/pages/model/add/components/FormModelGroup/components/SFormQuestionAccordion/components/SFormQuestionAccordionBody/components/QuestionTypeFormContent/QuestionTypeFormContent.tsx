import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { useFormContext, useWatch } from 'react-hook-form';
import { IAddFormModelFormsFields } from '../../../../../../../FormModelAddContent/FormModelAddContent.schema';
import { DateForm } from './components/DateForm';
import { LongTextForm } from './components/LongTextForm';
import { NumberForm } from './components/NumberForm';
import { OptionsForm } from './components/OptionsForm';
import { ShortTextForm } from './components/ShortTextForm';

interface QuestionTypeFormContentProps {
  sectionIndex: number;
  questionIndex: number;
}

export const QuestionTypeFormContent = ({
  sectionIndex,
  questionIndex,
}: QuestionTypeFormContentProps) => {
  const { control } = useFormContext<IAddFormModelFormsFields>();

  const questionTypeValue = useWatch({
    control,
    name: `sections.${sectionIndex}.items.${questionIndex}.type`,
  });

  const questionType = questionTypeValue?.value;

  const questionTypeFormMap = {
    [FormQuestionTypeEnum.SHORT_TEXT]: ShortTextForm,
    [FormQuestionTypeEnum.LONG_TEXT]: LongTextForm,
    [FormQuestionTypeEnum.NUMBER]: NumberForm,
    [FormQuestionTypeEnum.DATE]: DateForm,
    [FormQuestionTypeEnum.RADIO]: OptionsForm,
    [FormQuestionTypeEnum.CHECKBOX]: OptionsForm,
    [FormQuestionTypeEnum.SELECT]: OptionsForm,
    [FormQuestionTypeEnum.TEXT]: LongTextForm,
  };

  const renderFormContent = () => {
    const FormComponent = questionTypeFormMap[questionType];

    if (FormComponent) {
      return (
        <FormComponent
          sectionIndex={sectionIndex}
          questionIndex={questionIndex}
        />
      );
    }

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
  };

  return (
    <SFlex flexDirection="column" gap={4}>
      {renderFormContent()}
    </SFlex>
  );
};
