import * as yup from 'yup';

export const bankSchema = yup.object().shape({
  paymentType: yup.string().trim(),
  payment: yup.number().integer(),
});

export type IBankSchema = Record<keyof typeof bankSchema, string>;
