import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';
import { EnvironmentTypeEnum } from 'project/enum/environment-type.enum';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';

export const originRiskMap: Record<string, { name: string; type: string }> = {
  [EnvironmentTypeEnum.GENERAL]: {
    name: 'Visão Geral',
    type: 'Ambiente',
  },
  [EnvironmentTypeEnum.ADMINISTRATIVE]: {
    name: 'Ambiente Administrativo',
    type: 'Ambiente',
  },
  [EnvironmentTypeEnum.OPERATION]: {
    name: 'Ambiente Operacional',
    type: 'Ambiente',
  },
  [EnvironmentTypeEnum.SUPPORT]: {
    name: 'Ambiente de Apoio',
    type: 'Ambiente',
  },
  [CharacterizationTypeEnum.ACTIVITIES]: {
    name: 'Atividade',
    type: 'Mão de Obra',
  },
  [CharacterizationTypeEnum.EQUIPMENT]: {
    name: 'Equipamento',
    type: 'Mão de Obra',
  },
  [CharacterizationTypeEnum.WORKSTATION]: {
    name: 'Posto de Trabalho',
    type: 'Mão de Obra',
  },
  [HomoTypeEnum.ENVIRONMENT]: {
    name: 'Ambiente',
    type: 'Ambiente',
  },
  [HomoTypeEnum.WORKSTATION]: {
    name: 'Posto de Trabalho',
    type: 'Mão de Obra',
  },
  [HomoTypeEnum.ACTIVITIES]: {
    name: 'Atividade',
    type: 'Mão de Obra',
  },
  [HomoTypeEnum.GSE]: {
    name: 'GSE',
    type: 'Grupo Similar de Exposição',
  },
  [HomoTypeEnum.EQUIPMENT]: {
    name: 'Equipamento',
    type: 'Mão de Obra',
  },
  [HierarchyEnum.DIRECTORY]: { name: 'Diretoria', type: 'Nível Hierarquico' },
  [HierarchyEnum.MANAGEMENT]: { name: 'Gerência', type: 'Nível Hierarquico' },
  [HierarchyEnum.SECTOR]: { name: 'Setor', type: 'Nível Hierarquico' },
  [HierarchyEnum.SUB_SECTOR]: { name: 'Sub Setor', type: 'Nível Hierarquico' },
  [HierarchyEnum.OFFICE]: { name: 'Cargo', type: 'Nível Hierarquico' },
  [HierarchyEnum.SUB_OFFICE]: {
    name: 'Cargo Desenvolvido',
    type: 'Nível Hierarquico',
  },
};
