import { CommentTextTypeEnum } from '@v2/models/security/enums/comment-text-type.enum';
import * as yup from 'yup';

export interface IActionPlanCommentFormFormFields {
  text: string;
  textType: {
    value: CommentTextTypeEnum;
  };
}

export const schemaActionPlanCommentForm = yup.object({
  text: yup.string().required('Campo obrigatório'),
  textType: yup
    .object({
      value: yup.string().required('Campo Obrigatório'),
    })
    .required('Campo obrigatório'),
}) as any;

export const actionPlanCommentFormInitialValues =
  {} as IActionPlanCommentFormFormFields;
