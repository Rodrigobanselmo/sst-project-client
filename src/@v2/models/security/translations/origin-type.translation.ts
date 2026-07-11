import { OriginTypeEnum } from '../enums/origin-type.enum';

type OriginTypeTranslationMap = Record<OriginTypeEnum, string>;

export const originTypeTranslation: OriginTypeTranslationMap = {
  [OriginTypeEnum.HOMOGENEOUS_GROUP]: 'Grupo similar de exposição',
  [OriginTypeEnum.DIRECTORY]: 'Superintendência',
  [OriginTypeEnum.MANAGEMENT]: 'Diretoria',
  [OriginTypeEnum.SECTOR]: 'Setor',
  [OriginTypeEnum.SUB_SECTOR]: 'Sub setor',
  [OriginTypeEnum.OFFICE]: 'Cargo',
  [OriginTypeEnum.SUB_OFFICE]: 'Cargo desenvolvido',
  [OriginTypeEnum.WORKSTATION]: 'Posto de Trabalho',
  [OriginTypeEnum.EQUIPMENT]: 'Equipamento',
  [OriginTypeEnum.ACTIVITIES]: 'Atividade',
  [OriginTypeEnum.GENERAL]: 'Visão Geral',
  [OriginTypeEnum.SUPPORT]: 'Ambiente de Apoio',
  [OriginTypeEnum.OPERATION]: 'Ambiente Operacional',
  [OriginTypeEnum.ADMINISTRATIVE]: 'Ambiente Administrativo',
};
