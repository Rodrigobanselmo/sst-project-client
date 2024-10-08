import * as yup from 'yup';

export const recMedSchema = yup.object().shape(
  {
    recName: yup.string().when(['medName'], {
      is: (medName: string) => !medName,
      then: yup
        .string()
        .required('Preencha ao menos um dos campos para continuar') as any,
    }),
    medName: yup.string().when(['recName'], {
      is: (recName: string) => !recName,
      then: yup
        .string()
        .required('Preencha ao menos um dos campos para continuar') as any,
    }),
    medType: yup.string().when(['medName'], {
      is: (medName: string) => medName,
      then: yup
        .string()
        .required('Campo obrigatório para cadastrar medida de controle') as any,
    }),
  },
  [
    ['recName', 'medName'],
    ['medName', 'recName'],
  ],
);

export type IRecMedSchema = Record<keyof typeof recMedSchema, string>;
