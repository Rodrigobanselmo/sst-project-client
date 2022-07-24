import { EnvironmentTypeEnum } from 'project/enum/environment-type.enum';

import { IHierarchy } from './IHierarchy';
import { IRiskData } from './IRiskData';

export type IEnvironment = {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
  deleted_at?: Date;
  updated_at: Date;
  workspaceId: string;
  type: EnvironmentTypeEnum;
  parentEnvironmentId?: string;
  companyId: string;
  photos: IEnvironmentPhoto[];
  order?: number;
  noiseValue: string;
  temperature: string;
  moisturePercentage: string;
  luminosity: string;
  activities: string[];
  considerations: string[];
  hierarchies?: IHierarchy[];
  riskData?: IRiskData[];
};

export type IEnvironmentPhoto = {
  id: string;
  name: string;
  companyEnvironmentId: string;
  photoUrl: string;
  created_at: Date;
  deleted_at?: Date;
  updated_at: Date;
};
