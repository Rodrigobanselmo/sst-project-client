import { StatusEnum } from 'project/enum/status.enum';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IRiskData } from 'core/interfaces/api/IRiskData';

import { IWorkspace } from './ICompany';
import { IHierarchy } from './IHierarchy';

interface IHierarchyGho extends Omit<IHierarchy, 'workspaceIds'> {
  workspaceId: string;
}

/** Dados mínimos retornados na listagem de GHO para exibir tipo de origem (caracterização / ambiente). */
export interface IGhoCharacterizationRef {
  id: string;
  name: string;
  type: string;
}

export interface IGhoEnvironmentRef {
  id: string;
  name: string;
  type: string;
}

export interface IGho {
  id: string;
  created_at: Date;
  status: StatusEnum;
  name: string;
  description: string;
  companyId: string;
  hierarchies?: IHierarchyGho[];
  workspaces?: IWorkspace[];
  hierarchy?: IHierarchyGho;
  employeeCount: number;
  hierarchyOnHomogeneous?: IHierarchyOnHomogeneous[];
  workspaceIds: string[];
  type?: HomoTypeEnum;
  riskData?: IRiskData;
  characterization?: IGhoCharacterizationRef;
  environment?: IGhoEnvironmentRef;
  /**
   * Listagem paginada: quantidade de vínculos ativos em
   * HierarchyOnHomogeneous, de qualquer nível. Não é a coluna Cargos.
   */
  hierarchyCount?: number;
  /**
   * Listagem paginada: cargos OFFICE distintos abrangidos pelo GSE.
   * Não substitui hierarchyCount.
   */
  effectiveOfficeCount?: number;
  /** OFFICE com vínculo explícito no próprio cargo. */
  directOfficeCount?: number;
  /** OFFICE abrangidos só por ancestral, já sem os que têm vínculo direto. */
  inheritedOfficeCount?: number;
  inheritedOfficeOrigins?: {
    sourceHierarchyId: string;
    sourceType: string;
    sourceName: string;
    count: number;
  }[];
  /** Listagem paginada: RiskFactorData ativos do GSE. */
  riskCount?: number;
}

export interface IHierarchyOnHomogeneous {
  id: number;
  hierarchyId: string;
  homogeneousGroupId: string;
  workspaceId: string;
  hierarchy?: IHierarchy;
  workspace?: IWorkspace;
  homogeneousGroup?: IGho;
  endDate: Date;
  startDate: Date;
  deletedAt?: Date | string | null;
}
