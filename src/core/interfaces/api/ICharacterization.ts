import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';

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
