import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import * as yup from 'yup';
import { v4 } from 'uuid';
import { FormQuestionTypeEnumTranslate } from '@v2/models/form/translations/form-question-type.translation';
import { FormTypeTranslate } from '@v2/models/form/translations/form-type.translation';

export interface IFormModelItem {
  id?: string;
  apiId?: string;
  content: string;
  required: boolean;
  type: { value: FormQuestionTypeEnum; label: string };
  options?: { apiId?: string; value: string; label: string }[];
  minValue?: number;
  maxValue?: number;
}

export interface IFormModelSection {
  id?: string;
  apiId?: string;
  title: string;
  description?: string;
  items: IFormModelItem[];
}

export interface IFormModelForms {
  apiId?: string;
  title: string;
  description: string;
  anonymous: boolean;
  shareableLink: boolean;
  type: {
    label: string;
    value: FormTypeEnum;
  };
  sections: IFormModelSection[];
}

export const schemaFormModelForms = yup.object({
  title: yup.string().required('Título é obrigatório'),
  description: yup.string().required('Descrição é obrigatória'),
  anonymous: yup.boolean().default(false),
  shareableLink: yup.boolean().default(false),
  type: yup
    .object({
      label: yup.string().required('Tipo é obrigatório'),
      value: yup
        .mixed<FormTypeEnum>()
        .oneOf(Object.values(FormTypeEnum))
        .required('Tipo é obrigatório'),
    })
    .required('Tipo é obrigatório'),
  sections: yup
    .array()
    .of(
      yup.object({
        id: yup.string().required('ID é obrigatório'),
        apiId: yup.string().optional(),
        title: yup.string().required('Título da seção é obrigatório'),
        description: yup.string().optional(),
        items: yup
          .array()
          .of(
            yup.object({
              id: yup.string().required('ID é obrigatório'),
              apiId: yup.string().optional(),
              content: yup
                .string()
                .required('Conteúdo de pergunta é obrigatório'),
              required: yup.boolean().default(false),
              type: yup
                .object({
                  label: yup
                    .string()
                    .required('Tipo de pergunta é obrigatório'),
                  value: yup
                    .mixed<FormQuestionTypeEnum>()
                    .oneOf(Object.values(FormQuestionTypeEnum))
                    .required('Tipo de pergunta é obrigatório'),
                })
                .required('Tipo de pergunta é obrigatório'),
              options: yup
                .array()
                .of(
                  yup.object({
                    apiId: yup.string().optional(),
                    value: yup.string().optional(),
                    label: yup.string().optional(),
                  }),
                )
                .optional(),
              minValue: yup.number().optional(),
              maxValue: yup.number().optional(),
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
  options: Array.from({ length: 4 }, () => ({
    label: '',
    value: '',
  })),
  minValue: undefined,
  maxValue: undefined,
});

export const getFormSectionInitialValues = (): IFormModelSection => ({
  id: v4(),
  title: '',
  description: '',
  items: [getFormModelInitialValues()],
});

export const formModelFormsInitialValues: IFormModelForms = {
  title: '',
  description: '',
  anonymous: false,
  shareableLink: false,
  type: {
    value: FormTypeEnum.NORMAL,
    label: FormTypeTranslate[FormTypeEnum.NORMAL],
  },
  sections: [getFormSectionInitialValues()],
};
