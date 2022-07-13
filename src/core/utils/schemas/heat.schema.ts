import * as yup from 'yup';

export const heatSchema = yup.object().shape({
  mw: yup
    .string()
    .trim()
    .when('empty', {
      is: '',
      then: yup.string().required('Taxa metabólica obrigatório'),
    }),
  ibtug: yup
    .string()
    .trim()
    .when('empty', {
      is: '',
      then: yup.string().required('IBTUG obrigatório'),
    }),
  clothesType: yup.number().when('empty', {
    is: '',
    then: yup.number().required('Tipo de vestimento obrigatório'),
  }),
  empty: yup.string(),
});
