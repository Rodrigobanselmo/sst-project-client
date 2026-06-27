import {
  EsocialProcedureSourceEnum,
  EsocialProcedureStatusEnum,
  EsocialProcedureTypeEnum,
} from '@v2/services/medicine/esocial-procedure/service/esocial-procedure.types';

export const esocialProcedureStatusLabels: Record<
  EsocialProcedureStatusEnum,
  string
> = {
  [EsocialProcedureStatusEnum.DRAFT]: 'Rascunho',
  [EsocialProcedureStatusEnum.ACTIVE]: 'Ativo',
  [EsocialProcedureStatusEnum.DEPRECATED]: 'Inativo',
};

export const esocialProcedureStatusColors: Record<
  EsocialProcedureStatusEnum,
  'default' | 'success' | 'warning'
> = {
  [EsocialProcedureStatusEnum.DRAFT]: 'warning',
  [EsocialProcedureStatusEnum.ACTIVE]: 'success',
  [EsocialProcedureStatusEnum.DEPRECATED]: 'default',
};

export const esocialProcedureTypeLabels: Record<
  EsocialProcedureTypeEnum,
  string
> = {
  [EsocialProcedureTypeEnum.CLINICAL]: 'Clínico',
  [EsocialProcedureTypeEnum.LABORATORY]: 'Laboratorial',
  [EsocialProcedureTypeEnum.IMAGING]: 'Imagem',
  [EsocialProcedureTypeEnum.AUDIOMETRY]: 'Audiometria',
  [EsocialProcedureTypeEnum.SPIROMETRY]: 'Espirometria',
  [EsocialProcedureTypeEnum.TOXICOLOGICAL]: 'Toxicológico',
  [EsocialProcedureTypeEnum.OTHER]: 'Outro',
};

export const esocialProcedureSourceLabels: Record<
  EsocialProcedureSourceEnum,
  string
> = {
  [EsocialProcedureSourceEnum.ESOCIAL_TABLE_27]: 'Tabela 27 (eSocial)',
  [EsocialProcedureSourceEnum.SIMPLE_SST]: 'SimpleSST',
  [EsocialProcedureSourceEnum.TECHNICAL]: 'Critério técnico',
  [EsocialProcedureSourceEnum.OTHER]: 'Outro',
};
