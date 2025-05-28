import { FormIdentifierTypeEnum } from '../enums/form-identifier-type.enum';

export const FormIdentifierTypeTranslate: Record<
  FormIdentifierTypeEnum,
  string
> = {
  [FormIdentifierTypeEnum.EMAIL]: 'Email',
  [FormIdentifierTypeEnum.CPF]: 'CPF',
  [FormIdentifierTypeEnum.AGE]: 'Idade',
  [FormIdentifierTypeEnum.SEX]: 'Sexo',
  [FormIdentifierTypeEnum.WORKSPACE]: 'Estabelecimento',
  [FormIdentifierTypeEnum.DIRECTORY]: 'Diretoria',
  [FormIdentifierTypeEnum.MANAGEMENT]: 'Gerência',
  [FormIdentifierTypeEnum.SECTOR]: 'Setor',
  [FormIdentifierTypeEnum.SUB_SECTOR]: 'Subsetor',
  [FormIdentifierTypeEnum.OFFICE]: 'Cargo',
  [FormIdentifierTypeEnum.SUB_OFFICE]: 'Subcargo',
  [FormIdentifierTypeEnum.CUSTOM]: 'Customizado',
};
