import { SDatePickerForm } from '@v2/components/forms/controlled/SDatePickerForm/SDatePickerForm';
import { SInputForm } from '@v2/components/forms/controlled/SInputForm/SInputForm';
import { SRadioCheckboxForm } from '@v2/components/forms/controlled/SRadioCheckboxForm/SRadioCheckboxForm';
import { SRadioForm } from '@v2/components/forms/controlled/SRadioForm/SRadioForm';
import { SSelectForm } from '@v2/components/forms/controlled/SSelectForm/SSelectForm';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { FormQuestionReadModel } from '@v2/models/form/models/shared/form-question-read.model';
import React from 'react';

interface FormAnswerFieldControlledProps {
  question: FormQuestionReadModel;
  name: string;
}

export const FormAnswerFieldControlled: React.FC<FormAnswerFieldControlledProps> = ({
  question,
  name,
}) => {
  const { type } = question.details;

  const renderField = () => {
    switch (type) {
      case FormQuestionTypeEnum.SHORT_TEXT:
        return (
          <SInputForm
            name={name}
          />
        );

      case FormQuestionTypeEnum.LONG_TEXT:
        return (
          <SInputForm
            name={name}
            textFieldProps={{ multiline: true, rows: 4 }}
          />
        );

      case FormQuestionTypeEnum.NUMBER:
        return (
          <SInputForm
            name={name}
            type="number"
          />
        );

      case FormQuestionTypeEnum.DATE:
        return (
          <SDatePickerForm
            name={name}
          />
        );

      case FormQuestionTypeEnum.SELECT:
        return (
          <SSelectForm
            name={name}
            options={question.options}
            getOptionLabel={(option) => option.text}
            getOptionValue={(option) => option.value?.toString() || option.text}
          />
        );

      case FormQuestionTypeEnum.RADIO:
        return (
          <SRadioForm
            name={name}
            options={question.options}
            getOptionLabel={(option) => option.text}
            getOptionValue={(option) => option.value?.toString() || option.text}
          />
        );

      case FormQuestionTypeEnum.CHECKBOX:
        return (
          <SRadioCheckboxForm
            name={name}
            options={question.options}
            getOptionLabel={(option) => option.text}
            getOptionValue={(option) => option.value?.toString() || option.text}
          />
        );

      default:
        return (
          <SInputForm
            name={name}
            label={question.details.text}
          />
        );
    }
  };
  
  return renderField();
}; 