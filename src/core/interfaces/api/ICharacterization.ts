import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';

import { IHierarchy } from './IHierarchy';
import { IRiskData } from './IRiskData';

export type ICharacterization = {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
  deleted_at?: Date;
  updated_at: Date;
  workspaceId: string;
  type: CharacterizationTypeEnum;
  companyId: string;
  photos: ICharacterizationPhoto[];
  hierarchies?: IHierarchy[];
  riskData?: IRiskData[];
};

export type ICharacterizationPhoto = {
  id: string;
  name: string;
  companyCharacterizationId: string;
  photoUrl: string;
  created_at: Date;
  deleted_at?: Date;
  updated_at: Date;
};
