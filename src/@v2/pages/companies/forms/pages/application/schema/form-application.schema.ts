import { FormIdentifierTypeEnum } from '@v2/models/form/enums/form-identifier-type.enum';
import { FormIdentifierTypeTranslate } from '@v2/models/form/translations/form-identifier-type.translation';
import { v4 } from 'uuid';
import * as yup from 'yup';
import { InputFormModelSelectOptionProps } from '../components/FormApplicationForms/inputs/InputFormModelSelect/InputFormModelSelect';
import { InputWorkspaceSelectMultipleOptionProps } from '../components/FormApplicationForms/inputs/InputWorkspaceSelect/InputWorkspaceSelectMultiple';
export interface IFormIdentifierItem {
  id?: string;
  apiId?: string;
  content: string;
  required: boolean;
  disabledEdition: boolean;
  disableDuplication: boolean;
  type: { value: FormIdentifierTypeEnum; label: string };
  risks?: { id: string; name: string }[];
  options?: {
    apiId?: string;
    label: string;
    // value: string;
  }[];
}

export interface IFormIdentifierSection {
  id?: string;
  apiId?: string;
  title: string;
  description?: string;
  items: IFormIdentifierItem[];
}

export interface IFormApplicationFormFields {
  name: string;
  description?: string;
  shareableLink: {
    value: string;
    label: string;
  };
  anonymous: boolean;
  form: InputFormModelSelectOptionProps;
  workspaceIds: InputWorkspaceSelectMultipleOptionProps[];
  sections: IFormIdentifierSection[];
}

export const schemaFormApplicationForm = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  description: yup.string().optional(),
  shareableLink: yup
    .object({
      value: yup.string(),
      label: yup.string(),
    })
    .optional(),
  anonymous: yup.boolean().optional(),
  form: yup
    .object({
      id: yup.string().required('Campo obrigatório'),
      name: yup.string().required('Campo obrigatório'),
    })
    .required('Campo obrigatório'),
  workspaceIds: yup.array().test({
    name: 'workspace-ids',
    message: 'Campo obrigatório',
    exclusive: true,
    test: function (value) {
      if (!this.parent.form?.shareableLink && (!value || value.length === 0))
        return false;
      return true;
    },
  }),
  sections: yup
    .array()
    .of(
      yup.object({
        apiId: yup.string().optional(),
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
                    .mixed<FormIdentifierTypeEnum>()
                    .oneOf(Object.values(FormIdentifierTypeEnum))
                    .required('Tipo de pergunta é obrigatório'),
                })
                .required('Tipo de pergunta é obrigatório'),
              options: yup
                .array()
                .of(
                  yup.object({
                    apiId: yup.string().optional(),
                    label: yup.string().optional(),
                    // value: yup.string().optional(),
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

export const getFormApplicationInitialValues = ({
  type = FormIdentifierTypeEnum.CUSTOM,
  content = '',
  required = false,
  disabledEdition = false,
  disableDuplication = false,
}: {
  type?: FormIdentifierTypeEnum;
  content?: string;
  required?: boolean;
  disabledEdition?: boolean;
  disableDuplication?: boolean;
}) => ({
  id: v4(),
  content,
  required,
  disabledEdition,
  disableDuplication,
  type: {
    value: type,
    label: FormIdentifierTypeTranslate[type],
  },
  options:
    type === FormIdentifierTypeEnum.SECTOR
      ? []
      : Array.from({ length: 4 }, () => ({
          label: '',
          // value: '',
        })),
});

export const getFormApplicationInitialValuesRisk = ({
  type = FormIdentifierTypeEnum.CUSTOM,
  description = '',
  title = '',
  content = '',
  required = false,
  disabledEdition = false,
  disableDuplication = false,
}: {
  type?: FormIdentifierTypeEnum;
  description?: string;
  title?: string;
  content?: string;
  required?: boolean;
  disabledEdition?: boolean;
  disableDuplication?: boolean;
}) => ({
  id: v4(),
  title,
  description,
  items: [
    getFormApplicationInitialValues({
      type,
      content,
      required,
      disabledEdition,
      disableDuplication,
    }),
  ],
});

export const formApplicationFormInitialValues = {
  name: '',
  description: '',
  workspaceIds: [] as any[],
  form: {} as any,
  sections: [
    {
      id: v4(),
      title: '',
      description: '',
      items: [getFormApplicationInitialValues({})],
    },
  ],
} as IFormApplicationFormFields;

export const getFormApplicationInitialValuesShareableLink = () => ({
  ...formApplicationFormInitialValues,
});
