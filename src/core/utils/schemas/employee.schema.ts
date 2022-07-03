import * as yup from 'yup';

export const employeeSchema = yup.object().shape({
  name: yup.string().trim().required('nome obrigatório'),
  cpf: yup.string().trim().required('CPF obrigatório'),
});

export type IEmployeeSchema = Record<keyof typeof employeeSchema, string>;
