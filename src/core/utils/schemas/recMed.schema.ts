import * as yup from 'yup';

export const recMedSchema = yup.object().shape(
  {
    recName: yup.string().when(['medName'], {
      is: (medName: string) => !medName,
      then: yup.string().required('one'),
    }),
    medName: yup.string().when(['recName'], {
      is: (recName: string) => !recName,
      then: yup.string().required(),
    }),
  },
  [
    ['recName', 'medName'],
    ['medName', 'recName'],
  ],
);

export type IRecMedSchema = Record<keyof typeof recMedSchema, string>;
