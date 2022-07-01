import { EnvironmentTypeEnum } from 'project/enum/environment-type.enum';

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
  noiseValue: string;
  temperature: string;
  moisturePercentage: string;
  luminosity: string;
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
