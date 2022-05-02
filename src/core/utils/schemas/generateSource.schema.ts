import * as Yup from 'yup';

export const generateSourceSchema = {
  name: Yup.string().required('Campo obrigatório'),
  recName: Yup.string(),
  medName: Yup.string(),
  medType: Yup.string().when(['medName'], {
    is: (medName: string) => medName,
    then: Yup.string().required(
      'Campo obrigatório para cadastrar medida de controle',
    ),
  }),
};

export type IGenerateSourceSchema = Record<
  keyof typeof generateSourceSchema,
  string
>;
