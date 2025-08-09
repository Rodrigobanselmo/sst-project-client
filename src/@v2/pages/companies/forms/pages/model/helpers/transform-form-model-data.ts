import { IFormModelForms } from '@v2/pages/companies/forms/pages/model/schemas/form-model.schema';
import {
  AddFormParams,
  IFormQuestionGroup,
  IFormQuestion,
  IFormQuestionDetails,
  IFormQuestionOption,
} from '@v2/services/forms/form/add-form-model/service/add-form-model.service';

export function transformFormDataToApiFormat(
  data: IFormModelForms,
  companyId: string,
): AddFormParams {
  const questionGroups: IFormQuestionGroup[] = data.sections.map((section) => {
    const questions: IFormQuestion[] = section.items.map((item) => {
      const questionData: IFormQuestionDetails = {
        text: item.content,
        type: item.type.value,
      };

      const question: IFormQuestion & { id?: string } = {
        id: item.apiId,
        required: item.required,
        details: questionData,
      };

      if (item.options && item.options.length > 0) {
        const options: (IFormQuestionOption & { id?: string })[] = item.options
          .filter((option) => option.label && option.label.trim() !== '')
          .map((option, index) => ({
            id: option.apiId,
            text: option.label,
            value: option.value?.value,
          }));

        if (options.length > 0) {
          question.options = options;
        }
      }

      return question;
    });

    return {
      id: section.apiId,
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
    anonymous: data.anonymous,
    shareableLink: data.shareableLink,
    questionGroups,
  };
}
