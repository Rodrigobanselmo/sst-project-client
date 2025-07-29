import { FormIdentifierTypeEnum } from '@v2/models/form/enums/form-identifier-type.enum';
import { FormIdentifierTypeTranslate } from '@v2/models/form/translations/form-identifier-type.translation';
import SmartButtonIcon from '@mui/icons-material/SmartButton';

export interface IFormIdentifierTypeOption {
  value: FormIdentifierTypeEnum;
  label: string;
  icon: React.ReactNode;
}
interface IFormIdentifierTypeOptions
  extends Record<FormIdentifierTypeEnum, IFormIdentifierTypeOption> {}

export const formIdentifierTypeMap: IFormIdentifierTypeOptions = {
  [FormIdentifierTypeEnum.EMAIL]: {
    value: FormIdentifierTypeEnum.EMAIL,
    label: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.EMAIL],
    icon: <SmartButtonIcon />,
  },
  [FormIdentifierTypeEnum.CPF]: {
    value: FormIdentifierTypeEnum.CPF,
    label: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.CPF],
    icon: <SmartButtonIcon />,
  },
  [FormIdentifierTypeEnum.AGE]: {
    value: FormIdentifierTypeEnum.AGE,
    label: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.AGE],
    icon: <SmartButtonIcon />,
  },
  [FormIdentifierTypeEnum.SEX]: {
    value: FormIdentifierTypeEnum.SEX,
    label: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.SEX],
    icon: <SmartButtonIcon />,
  },
  [FormIdentifierTypeEnum.WORKSPACE]: {
    value: FormIdentifierTypeEnum.WORKSPACE,
    label: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.WORKSPACE],
    icon: <SmartButtonIcon />,
  },
  [FormIdentifierTypeEnum.DIRECTORY]: {
    value: FormIdentifierTypeEnum.DIRECTORY,
    label: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.DIRECTORY],
    icon: <SmartButtonIcon />,
  },
  [FormIdentifierTypeEnum.MANAGEMENT]: {
    value: FormIdentifierTypeEnum.MANAGEMENT,
    label: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.MANAGEMENT],
    icon: <SmartButtonIcon />,
  },
  [FormIdentifierTypeEnum.SECTOR]: {
    value: FormIdentifierTypeEnum.SECTOR,
    label: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.SECTOR],
    icon: <SmartButtonIcon />,
  },
  [FormIdentifierTypeEnum.SUB_SECTOR]: {
    value: FormIdentifierTypeEnum.SUB_SECTOR,
    label: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.SUB_SECTOR],
    icon: <SmartButtonIcon />,
  },
  [FormIdentifierTypeEnum.OFFICE]: {
    value: FormIdentifierTypeEnum.OFFICE,
    label: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.OFFICE],
    icon: <SmartButtonIcon />,
  },
  [FormIdentifierTypeEnum.SUB_OFFICE]: {
    value: FormIdentifierTypeEnum.SUB_OFFICE,
    label: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.SUB_OFFICE],
    icon: <SmartButtonIcon />,
  },
  [FormIdentifierTypeEnum.CUSTOM]: {
    value: FormIdentifierTypeEnum.CUSTOM,
    label: FormIdentifierTypeTranslate[FormIdentifierTypeEnum.CUSTOM],
    icon: <SmartButtonIcon sx={{ fontSize: 20, ml: 4 }} />,
  },
};

export const FormIdentifierTypeList = [
  // formIdentifierTypeMap[FormIdentifierTypeEnum.EMAIL],
  // formIdentifierTypeMap[FormIdentifierTypeEnum.CPF],
  // formIdentifierTypeMap[FormIdentifierTypeEnum.AGE],
  // formIdentifierTypeMap[FormIdentifierTypeEnum.SEX],
  // formIdentifierTypeMap[FormIdentifierTypeEnum.WORKSPACE],
  // formIdentifierTypeMap[FormIdentifierTypeEnum.DIRECTORY],
  // formIdentifierTypeMap[FormIdentifierTypeEnum.MANAGEMENT],
  // formIdentifierTypeMap[FormIdentifierTypeEnum.SECTOR],
  // formIdentifierTypeMap[FormIdentifierTypeEnum.SUB_SECTOR],
  // formIdentifierTypeMap[FormIdentifierTypeEnum.OFFICE],
  // formIdentifierTypeMap[FormIdentifierTypeEnum.SUB_OFFICE],
  formIdentifierTypeMap[FormIdentifierTypeEnum.CUSTOM],
];
