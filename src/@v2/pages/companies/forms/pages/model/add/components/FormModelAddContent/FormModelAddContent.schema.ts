import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import * as yup from 'yup';
import { v4 } from 'uuid';

export interface IFormModelItem {
  id: string;
  content: string;
  required: boolean;
  type: FormQuestionTypeEnum;
}

export interface IAddFormModelFormsFields {
  title: string;
  description: string;
  type: FormTypeEnum;
  items: IFormModelItem[];
}

export const schemaAddFormModelForms = yup.object({
  title: yup.string().required('Campo é obrigatório'),
  description: yup.string().required('Campo é obrigatório'),
  type: yup
    .mixed<FormTypeEnum>()
    .oneOf(Object.values(FormTypeEnum))
    .required('Campo é obrigatório'),
  items: yup
    .array()
    .of(
      yup.object({
        id: yup.string().required(),
        content: yup.string().required('Conteúdo é obrigatório'),
        required: yup.boolean().default(false),
        type: yup
          .mixed<FormQuestionTypeEnum>()
          .oneOf(Object.values(FormQuestionTypeEnum))
          .default(FormQuestionTypeEnum.TEXT),
      }),
    )
    .min(1, 'Adicione pelo menos um item'),
}) as any;

export const getFormModelInitialValues = () => ({
  id: v4(),
  content: '',
  required: false,
  type: FormQuestionTypeEnum.TEXT,
});

export const addFormModelFormsInitialValues: IAddFormModelFormsFields = {
  title: '',
  description: '',
  type: undefined as any,
  items: [getFormModelInitialValues()],
};
