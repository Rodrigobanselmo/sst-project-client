import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import * as yup from 'yup';

export interface IAddFormModelFormsFields {
  title: string;
  description: string;
  type: FormTypeEnum;
}

export const schemaAddFormModelForms = yup.object({
  title: yup.string().required('Campo é obrigatório'),
  description: yup.string().required('Campo é obrigatório'),
  type: yup
    .mixed<FormTypeEnum>()
    .oneOf(Object.values(FormTypeEnum))
    .required('Campo é obrigatório'),
}) as any;

export const addFormModelFormsInitialValues = {} as IAddFormModelFormsFields;
