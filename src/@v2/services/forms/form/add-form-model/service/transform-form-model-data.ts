import { IAddFormModelFormsFields } from '@v2/pages/companies/forms/pages/model/add/components/FormModelAddContent/FormModelAddContent.schema';
import {
  AddFormParams,
  IFormQuestionGroup,
  IFormQuestion,
  IFormQuestionDetails,
  IFormQuestionOption,
} from './add-form-model.service';

export function transformFormDataToApiFormat(
  data: IAddFormModelFormsFields,
  companyId: string,
): AddFormParams {
  const questionGroups: IFormQuestionGroup[] = data.sections.map((section) => {
    const questions: IFormQuestion[] = section.items.map((item) => {
      const questionData: IFormQuestionDetails = {
        text: item.content,
        type: item.type.value,
      };

      const question: IFormQuestion = {
        required: item.required,
        details: questionData,
      };

      // Add options if the question type requires them
      if (item.options && item.options.length > 0) {
        const options: IFormQuestionOption[] = item.options
          .filter((option) => option.label && option.label.trim() !== '')
          .map((option, index) => ({
            text: option.label,
            value: index + 1, // Sequential numbering starting from 1
          }));

        if (options.length > 0) {
          question.options = options;
        }
      }

      return question;
    });

    return {
      name: section.title,
      description: section.description,
      questions,
    };
  });

  return {
    companyId,
    name: data.title,
    description: data.description,
    type: data.type.value,
    questionGroups,
  };
}
