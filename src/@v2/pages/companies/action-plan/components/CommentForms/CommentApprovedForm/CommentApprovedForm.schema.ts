import { CommentTextTypeEnum } from '@v2/models/security/enums/comment-text-type.enum';
import * as yup from 'yup';

export interface ICommentApprovedFormFormFields {
  text: string;
}

export const schemaCommentApprovedForm = yup.object({
  text: yup.string().optional(),
}) as any;

export const commentApprovedFormInitialValues =
  {} as ICommentApprovedFormFormFields;
