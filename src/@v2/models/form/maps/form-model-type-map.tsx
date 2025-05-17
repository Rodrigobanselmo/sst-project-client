import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { FormTypeTranslate } from '@v2/models/form/translations/form-type.translation';

type FormModelTypesEnumTypeMapValue = {
  label: string;
};

export const FormModelTypesMap: Record<
  FormTypeEnum,
  FormModelTypesEnumTypeMapValue
> = {
  [FormTypeEnum.NORMAL]: {
    label: FormTypeTranslate[FormTypeEnum.NORMAL],
  },
  [FormTypeEnum.PSYCHOSOCIAL]: {
    label: FormTypeTranslate[FormTypeEnum.PSYCHOSOCIAL],
  },
  [FormTypeEnum.RISK]: {
    label: FormTypeTranslate[FormTypeEnum.RISK],
  },
};

export const FormModelTypesFilterList = Object.entries(FormModelTypesMap).map(
  ([value, { label }]) => ({
    value: value as FormTypeEnum,
    label,
  }),
);
