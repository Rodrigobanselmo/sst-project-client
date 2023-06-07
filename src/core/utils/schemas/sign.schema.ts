import * as Yup from 'yup';

export const signSchema = {
  email: Yup.string()
    .email('e-mail mal formatado')
    .required('Campo obrigatório'),
  password: Yup.string()
    .min(8, 'senha deve conter no mínimo 8 characteres')
    .required('Campo obrigatório'),
  passwordConfirmation: Yup.string().oneOf(
    [Yup.ref('password'), null as unknown as any],
    'As senhas devem ser iguais',
  ),
};
export const oldPassSchema = {
  oldPassword: Yup.string()
    // .min(8, 'senha deve conter no mínimo 8 characteres')
    .required('Campo obrigatório'),
};

export type ISignSchema = Record<keyof typeof signSchema, string>;
