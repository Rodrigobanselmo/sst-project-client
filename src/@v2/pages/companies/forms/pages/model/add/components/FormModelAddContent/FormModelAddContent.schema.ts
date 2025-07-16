import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import * as yup from 'yup';
import { v4 } from 'uuid';
import { FormQuestionTypeEnumTranslate } from '@v2/models/form/translations/form-question-type.translation';

export interface IFormModelItem {
  id: string;
  content: string;
  required: boolean;
  type: { value: FormQuestionTypeEnum };
  options?: { value: string; label: string }[];
  placeholder?: string;
  minValue?: number;
  maxValue?: number;
  defaultValue?: Date;
  scale?: string;
}

export interface IFormModelSection {
  id: string;
  title: string;
  description?: string;
  items: IFormModelItem[];
}

export interface IAddFormModelFormsFields {
  title: string;
  description: string;
  type: {
    label: string;
    value: FormTypeEnum;
  };
  sections: IFormModelSection[];
}

export const schemaAddFormModelForms = yup.object({
  title: yup.string().required('Campo é obrigatório'),
  description: yup.string().required('Campo é obrigatório'),
  type: yup
    .object({
      label: yup.string().required(),
      value: yup
        .mixed<FormTypeEnum>()
        .oneOf(Object.values(FormTypeEnum))
        .required('Campo Obrigatório'),
    })
    .required('Campo obrigatório'),
  sections: yup
    .array()
    .of(
      yup.object({
        id: yup.string().required(),
        title: yup.string().required('Título da seção é obrigatório'),
        description: yup.string().optional(),
        items: yup
          .array()
          .of(
            yup.object({
              id: yup.string().required(),
              content: yup.string().required('Conteúdo é obrigatório'),
              required: yup.boolean().default(false),
              type: yup
                .object({
                  label: yup.string().required(),
                  value: yup
                    .mixed<FormQuestionTypeEnum>()
                    .oneOf(Object.values(FormQuestionTypeEnum))
                    .required('Campo Obrigatório'),
                })
                .required('Campo obrigatório'),
              options: yup
                .array()
                .of(
                  yup.object({
                    value: yup.string().required(),
                    label: yup.string().required(),
                  }),
                )
                .optional(),
              placeholder: yup.string().optional(),
              minValue: yup.number().optional(),
              maxValue: yup.number().optional(),
              defaultValue: yup.date().optional(),
              scale: yup.string().optional(),
            }),
          )
          .min(1, 'Adicione pelo menos um item'),
      }),
    )
    .min(1, 'Adicione pelo menos uma seção'),
}) as any;

export const getFormModelInitialValues = () => ({
  id: v4(),
  content: '',
  required: false,
  type: {
    value: FormQuestionTypeEnum.RADIO,
    label: FormQuestionTypeEnumTranslate[FormQuestionTypeEnum.RADIO],
  },
  options: [],
  placeholder: '',
  minValue: undefined,
  maxValue: undefined,
  defaultValue: undefined,
  scale: undefined,
});

export const getFormSectionInitialValues = (): IFormModelSection => ({
  id: v4(),
  title: '',
  description: '',
  items: [getFormModelInitialValues()],
});

export const addFormModelFormsInitialValues: IAddFormModelFormsFields = {
  title: '',
  description: '',
  type: undefined as any,
  sections: [getFormSectionInitialValues()],
};
