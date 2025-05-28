import { FormIdentifierTypeEnum } from '@v2/models/form/enums/form-identifier-type.enum';
import { FormIdentifierTypeTranslate } from '@v2/models/form/translations/form-identifier-type.translation';

export interface IFormIdentifierTypeOption {
  value: FormIdentifierTypeEnum;
  content: string;
}
interface IFormIdentifierTypeOptions
  extends Record<FormIdentifierTypeEnum, IFormIdentifierTypeOption> {}

export const formIdentifierTypeMap: IFormIdentifierTypeOptions = {
  [FormIdentifierTypeEnum.EMAIL]: {
    value: FormIdentifierTypeEnum.EMAIL,
    content: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.EMAIL],
  },
  [FormIdentifierTypeEnum.CPF]: {
    value: FormIdentifierTypeEnum.CPF,
    content: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.CPF],
  },
  [FormIdentifierTypeEnum.AGE]: {
    value: FormIdentifierTypeEnum.AGE,
    content: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.AGE],
  },
  [FormIdentifierTypeEnum.SEX]: {
    value: FormIdentifierTypeEnum.SEX,
    content: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.SEX],
  },
  [FormIdentifierTypeEnum.WORKSPACE]: {
    value: FormIdentifierTypeEnum.WORKSPACE,
    content: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.WORKSPACE],
  },
  [FormIdentifierTypeEnum.DIRECTORY]: {
    value: FormIdentifierTypeEnum.DIRECTORY,
    content: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.DIRECTORY],
  },
  [FormIdentifierTypeEnum.MANAGEMENT]: {
    value: FormIdentifierTypeEnum.MANAGEMENT,
    content: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.MANAGEMENT],
  },
  [FormIdentifierTypeEnum.SECTOR]: {
    value: FormIdentifierTypeEnum.SECTOR,
    content: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.SECTOR],
  },
  [FormIdentifierTypeEnum.SUB_SECTOR]: {
    value: FormIdentifierTypeEnum.SUB_SECTOR,
    content: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.SUB_SECTOR],
  },
  [FormIdentifierTypeEnum.OFFICE]: {
    value: FormIdentifierTypeEnum.OFFICE,
    content: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.OFFICE],
  },
  [FormIdentifierTypeEnum.SUB_OFFICE]: {
    value: FormIdentifierTypeEnum.SUB_OFFICE,
    content: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.SUB_OFFICE],
  },
  [FormIdentifierTypeEnum.CUSTOM]: {
    value: FormIdentifierTypeEnum.CUSTOM,
    content: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.CUSTOM],
  },
};

export const FormIdentifierTypeList = [
  formIdentifierTypeMap[FormIdentifierTypeEnum.EMAIL],
  formIdentifierTypeMap[FormIdentifierTypeEnum.CPF],
  formIdentifierTypeMap[FormIdentifierTypeEnum.AGE],
  formIdentifierTypeMap[FormIdentifierTypeEnum.SEX],
  formIdentifierTypeMap[FormIdentifierTypeEnum.WORKSPACE],
  formIdentifierTypeMap[FormIdentifierTypeEnum.DIRECTORY],
  formIdentifierTypeMap[FormIdentifierTypeEnum.MANAGEMENT],
  formIdentifierTypeMap[FormIdentifierTypeEnum.SECTOR],
  formIdentifierTypeMap[FormIdentifierTypeEnum.SUB_SECTOR],
  formIdentifierTypeMap[FormIdentifierTypeEnum.OFFICE],
  formIdentifierTypeMap[FormIdentifierTypeEnum.SUB_OFFICE],
  formIdentifierTypeMap[FormIdentifierTypeEnum.CUSTOM],
];
