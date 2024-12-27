import * as yup from 'yup';

export interface IActionPlanCommentDoneFormFormFields {
  text: string;
}

export const schemaActionPlanCommentDoneForm = yup.object({
  text: yup.string().optional(),
}) as any;

export const actionPlanCommentDoneFormInitialValues =
  {} as IActionPlanCommentDoneFormFormFields;
