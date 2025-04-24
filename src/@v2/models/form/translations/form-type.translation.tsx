import { FormTypeEnum } from '../enums/form-type.enum';

export const FormTypeTranslate: Record<FormTypeEnum, string> = {
  [FormTypeEnum.NORMAL]: 'Normal',
  [FormTypeEnum.PSYCHOSOCIAL]: 'Psicossocial',
  [FormTypeEnum.RISK]: 'Risco',
};
