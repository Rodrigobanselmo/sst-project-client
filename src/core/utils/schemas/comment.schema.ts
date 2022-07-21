import * as Yup from 'yup';

export const commentSchema = Yup.object().shape({
  text: Yup.string().required('Campo obrigatório'),
  textType: Yup.string().required('Campo obrigatório'),
});

export type ICommentSchema = Record<keyof typeof commentSchema, string>;
