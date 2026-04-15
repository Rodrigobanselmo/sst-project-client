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
}
