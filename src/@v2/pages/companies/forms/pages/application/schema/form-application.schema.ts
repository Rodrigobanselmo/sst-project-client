import { FormIdentifierTypeEnum } from '@v2/models/form/enums/form-identifier-type.enum';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { FormIdentifierTypeTranslate } from '@v2/models/form/translations/form-identifier-type.translation';
import { v4 } from 'uuid';
import * as yup from 'yup';
import { InputFormModelSelectOptionProps } from '../components/FormApplicationForms/inputs/InputFormModelSelect/InputFormModelSelect';
import { InputWorkspaceSelectMultipleOptionProps } from '../components/FormApplicationForms/inputs/InputWorkspaceSelect/InputWorkspaceSelectMultiple';
import { InputCompanyGroupSelectOptionProps } from '../components/FormApplicationForms/inputs/InputCompanyGroupSelect/InputCompanyGroupSelect';
import { InputCompanyGroupCompaniesSelectMultipleOptionProps } from '../components/FormApplicationForms/inputs/InputCompanyGroupCompaniesSelect/InputCompanyGroupCompaniesSelectMultiple';
import { FormApplicationScopeTypeEnum } from '@v2/models/form/enums/form-application-scope-type.enum';

export const FORM_APPLICATION_SCOPE_TYPE_OPTIONS = [
  {
    value: FormApplicationScopeTypeEnum.COMPANY_WORKSPACES,
    label: 'Empresa e estabelecimentos',
  },
  {
    value: FormApplicationScopeTypeEnum.BUSINESS_GROUP_COMPANIES,
    label: 'Grupo empresarial e empresas',
  },
] as const;

export type FormApplicationScopeTypeOption = {
  value: FormApplicationScopeTypeEnum;
  label: string;
};

export function buildFormApplicationScopeFormDefaults(params: {
  scopeType: FormApplicationScopeTypeEnum;
  companyGroupId: number | null;
  companies: { id: string; name: string }[];
  workspaces: { id: string; name: string }[];
}): Pick<
  IFormApplicationFormFields,
  'scopeType' | 'companyGroup' | 'companyIds' | 'workspaceIds'
> {
  const scopeType =
    FORM_APPLICATION_SCOPE_TYPE_OPTIONS.find(
      (option) => option.value === params.scopeType,
    ) ?? FORM_APPLICATION_SCOPE_TYPE_OPTIONS[0];

  return {
    scopeType,
    companyGroup: params.companyGroupId
      ? { id: params.companyGroupId, name: '' }
      : null,
    companyIds: params.companies.map((company) => ({
      id: company.id,
      name: company.name,
    })),
    workspaceIds: params.workspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
    })),
  };
}

export function resolveFormApplicationScopeType(
  scopeType?: FormApplicationScopeTypeOption | FormApplicationScopeTypeEnum | null,
): FormApplicationScopeTypeEnum {
  if (!scopeType) {
    return FormApplicationScopeTypeEnum.COMPANY_WORKSPACES;
  }

  if (typeof scopeType === 'string') {
    return scopeType;
  }

  return scopeType.value ?? FormApplicationScopeTypeEnum.COMPANY_WORKSPACES;
}

const isBusinessGroupScopeType = (
  scopeType?: FormApplicationScopeTypeOption | FormApplicationScopeTypeEnum | null,
) =>
  resolveFormApplicationScopeType(scopeType) ===
  FormApplicationScopeTypeEnum.BUSINESS_GROUP_COMPANIES;

const isCompanyWorkspacesScopeType = (
  scopeType?: FormApplicationScopeTypeOption | FormApplicationScopeTypeEnum | null,
) =>
  resolveFormApplicationScopeType(scopeType) ===
  FormApplicationScopeTypeEnum.COMPANY_WORKSPACES;

export interface IFormIdentifierItem {
  id?: string;
  apiId?: string;
  content: string;
  required: boolean;
  disabledEdition: boolean;
  disableDuplication: boolean;
  type: { value: FormIdentifierTypeEnum; label: string };
  risks?: { id: string; name: string }[];
  /** Quando definido, sobrescreve o mapeamento padrão em `transformFormApplicationDataToApiFormat` (ex.: cópia da biblioteca). */
  detailsQuestionType?: FormQuestionTypeEnum;
  acceptOther?: boolean;
  options?: {
    apiId?: string;
    label: string;
    /** Valor numérico opcional enviado à API (ex.: opções copiadas da biblioteca). */
    responseValue?: number;
    /** Campo legado de UI (escalas / select). Distinto de `responseValue`. */
    value?: string;
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
  participationGoal?: number;
  shareableLink: {
    value: string;
    label: string;
  };
  anonymous: boolean;
  form: InputFormModelSelectOptionProps;
  scopeType: FormApplicationScopeTypeOption;
  companyGroup: InputCompanyGroupSelectOptionProps | null;
  companyIds: InputCompanyGroupCompaniesSelectMultipleOptionProps[];
  workspaceIds: InputWorkspaceSelectMultipleOptionProps[];
  sections: IFormIdentifierSection[];
  bannerIntroText?: string;
  bannerWhyText?: string;
  bannerContactText?: string;
}

export const schemaFormApplicationForm = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  description: yup.string().optional(),
  participationGoal: yup
    .number()
    .optional()
    .transform((_, originalValue) => {
      // Se o valor original é uma string vazia ou undefined, retorna undefined
      if (originalValue === '' || originalValue === undefined) return undefined;
      // Converte string para número
      const numValue = Number(originalValue);
      return isNaN(numValue) ? undefined : numValue;
    })
    .min(0, 'Meta deve ser no mínimo 0%')
    .max(100, 'Meta deve ser no máximo 100%')
    .integer('Meta deve ser um número inteiro'),
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
  scopeType: yup
    .object({
      value: yup
        .mixed<FormApplicationScopeTypeEnum>()
        .oneOf(Object.values(FormApplicationScopeTypeEnum))
        .required(),
      label: yup.string().required(),
    })
    .required(),
  companyGroup: yup
    .object({
      id: yup.number().required(),
      name: yup.string().required(),
    })
    .nullable()
    .when('scopeType', {
      is: isBusinessGroupScopeType,
      then: (schema) => schema.required('Grupo empresarial é obrigatório'),
      otherwise: (schema) => schema.nullable().optional(),
    }),
  companyIds: yup.array().when('scopeType', {
    is: isBusinessGroupScopeType,
    then: (schema) =>
      schema
        .min(1, 'Selecione ao menos uma empresa do grupo')
        .required('Selecione ao menos uma empresa do grupo'),
    otherwise: (schema) => schema.optional(),
  }),
  workspaceIds: yup.array().when('scopeType', {
    is: isCompanyWorkspacesScopeType,
    then: (schema) =>
      schema.test({
        name: 'workspace-ids',
        message: 'Campo obrigatório',
        test: function (value) {
          if (!this.parent.form?.shareableLink && (!value || value.length === 0))
            return false;
          return true;
        },
      }),
    otherwise: (schema) => schema.optional(),
  }),
  bannerIntroText: yup.string().optional(),
  bannerWhyText: yup.string().optional(),
  bannerContactText: yup.string().optional(),
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
  participationGoal: undefined,
  bannerIntroText: '',
  bannerWhyText: '',
  bannerContactText: '',
  scopeType: FORM_APPLICATION_SCOPE_TYPE_OPTIONS[0],
  companyGroup: null,
  companyIds: [] as InputCompanyGroupCompaniesSelectMultipleOptionProps[],
  workspaceIds: [] as InputWorkspaceSelectMultipleOptionProps[],
  form: {} as InputFormModelSelectOptionProps,
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
