import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { UseFormReturn } from 'react-hook-form';

export interface IFormSection {
  items: Array<{
    type: { value: FormQuestionTypeEnum };
    options?: Array<{ label: string }>;
  }>;
}

export interface IFormData {
  sections: IFormSection[];
}

export const validateFormOptions = (
  data: IFormData,
  form: UseFormReturn<any>,
): boolean => {
  let hasValidationErrors = false;

  data.sections.forEach((section, sectionIndex) => {
    section.items.forEach((item, itemIndex) => {
      const requiresOptions = [
        FormQuestionTypeEnum.CHECKBOX,
        FormQuestionTypeEnum.RADIO,
        FormQuestionTypeEnum.SELECT,
      ].includes(item.type.value);

      if (requiresOptions) {
        item.options?.forEach((option, optionIndex) => {
          if (!option.label || option.label.trim() === '') {
            form.setError(
              `sections.${sectionIndex}.items.${itemIndex}.options.${optionIndex}.label`,
              {
                type: 'required',
                message: 'Label da opção é obrigatório',
              },
            );
            hasValidationErrors = true;
          }
        });
      }
    });
  });

  return hasValidationErrors;
};
