import * as Yup from 'yup';

export const loginSchema = {
  email: Yup.string()
    .email('e-mail mal formatado')
    .required('Campo obrigatório'),
  password: Yup.string()
    .min(8, 'senha deve conter no mínimo 8 characteres')
    .required('Campo obrigatório'),
};

export type ILoginSchema = Record<keyof typeof loginSchema, string>;
