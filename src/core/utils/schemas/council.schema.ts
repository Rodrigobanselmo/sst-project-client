import * as yup from 'yup';

export const councilSchema = yup.object().shape({
  councilUF: yup.string().trim().required('campo obrigatório'),
  councilId: yup.string().trim().required('campo obrigatório'),
  councilType: yup.string().trim().required('campo obrigatório'),
});
