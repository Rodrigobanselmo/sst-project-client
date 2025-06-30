import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { useForm } from 'react-hook-form';
import { FormModelGroup } from '../FormModelGroup/FormModelGroup';
import { FormModelInfo } from '../FormModelInfo/FormModelInfo';
import {
  addFormModelFormsInitialValues,
  schemaAddFormModelForms,
} from './FormModelAddContent.schema';

export const FormModelAddContent = ({ companyId }: { companyId: string }) => {
  const form = useForm({
    resolver: yupResolver(schemaAddFormModelForms),
    defaultValues: addFormModelFormsInitialValues,
  });

  return (
    <SForm form={form}>
      <FormModelInfo containerProps={{ mb: 16 }} />
      <FormModelGroup companyId={companyId} />
    </SForm>
  );
};
