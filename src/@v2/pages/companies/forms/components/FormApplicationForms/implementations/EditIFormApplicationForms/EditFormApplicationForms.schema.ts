import * as yup from 'yup';

export interface IEditFormApplicationFormFields {
  name: string;
  // type: { value: string };
  // typeText?: string;
  description?: string;
}

export const schemaEditFormApplicationForm = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  description: yup.string().optional(),
  type: yup
    .object({
      value: yup.string().required('Campo Obrigatório'),
    })
    .required('Campo obrigatório'),
  // typeText: yup.string().test({
  //   name: 'text-type',
  //   message: 'Tipo é obrigatório',
  //   exclusive: true,
  //   test: function (value) {
  //     if (this.parent.type?.value === FormApplicationTypeEnum.OTHER && !value)
  //       return false;
  //     return true;
  //   },
  // }),
}) as any;
