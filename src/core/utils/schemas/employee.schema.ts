import * as yup from 'yup';

export const employeeSchema = yup.object().shape({
  name: yup.string().trim().required('nome obrigatório'),
  cpf: yup.string().trim().required('CPF obrigatório'),
  sex: yup.string().trim().required('Sexo obrigatório'),
});

export type IEmployeeSchema = Record<keyof typeof employeeSchema, string>;

export const employeeHistoryHierarchySchema = yup.object().shape({
  motive: yup.string().trim().required('Campo obrigatório'),
  startDate: yup.string().trim().required('Data obrigatório'),
});

export const employeeHistoryExamSchema = yup.object().shape({
  // doneDate: yup
  //   .string()
  //   .nullable()
  //   .trim()
  //   .required('Data de inicío obrigatório'),
  // examType: yup.string().trim().required('Campo obrigatório'),
});
