import { FormIdentifierTypeEnum } from '@v2/models/form/enums/form-identifier-type.enum';
import { FileAsync } from '@v2/types/file-async';
import * as yup from 'yup';
import { InputFormModelSelectOptionProps } from '../../inputs/InputFormModelSelect/InputFormModelSelect';
import { InputWorkspaceSelectMultipleOptionProps } from '../../inputs/InputWorkspaceSelect/InputWorkspaceSelectMultiple';

export interface IAddFormApplicationFormFields {
  name: string;
  description?: string;
  form: InputFormModelSelectOptionProps;
  workspaceIds: InputWorkspaceSelectMultipleOptionProps[];
}

export const schemaAddFormApplicationForm = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  description: yup.string().optional(),
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
}) as any;

export const addFormApplicationFormInitialValues = {
  workspaceIds: [] as any[],
  form: {} as any,
} as IAddFormApplicationFormFields;
