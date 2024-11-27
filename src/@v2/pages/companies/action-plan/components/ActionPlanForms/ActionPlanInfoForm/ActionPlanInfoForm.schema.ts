import * as yup from 'yup';

export interface IActionPlanInfoFormFormFields {
  coordinator?: {
    id: number;
    name: string;
  } | null;
  validityStart?: Date;
  validityEnd?: Date;
  monthsLevel_2?: number;
  monthsLevel_3?: number;
  monthsLevel_4?: number;
  monthsLevel_5?: number;
}

export const schemaActionPlanInfoForm = yup.object({
  coordinator: yup
    .object({
      id: yup.number().required('Campo Obrigatório'),
      name: yup.string().required('Campo Obrigatório'),
    })
    .nullable()
    .optional(),

  validityStart: yup.date().nonNullable('Campo Obrigatório').optional(),
  validityEnd: yup.date().nullable().optional(),
  monthsLevel_2: yup.number().optional(),
  monthsLevel_3: yup.number().optional(),
  monthsLevel_4: yup.number().optional(),
  monthsLevel_5: yup.number().optional(),
}) as any;

export const actionPlanInfoFormInitialValues =
  {} as IActionPlanInfoFormFormFields;
