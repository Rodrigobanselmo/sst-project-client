import * as yup from 'yup';

export const protocolSchema = yup.object().shape({
  name: yup.string().trim().required('nome obrigatório'),
});

export const protocolRiskSchema = yup.object().shape({});
