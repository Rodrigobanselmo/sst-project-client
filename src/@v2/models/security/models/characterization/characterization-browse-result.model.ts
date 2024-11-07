import { dateUtils } from '@v2/utils/date-utils';
import { CharacterizationTypeEnum } from '../../enums/characterization-type.enum';
import { HierarchyTypeEnum } from '../../enums/hierarchy-type.enum';

export type ICharacterizationBrowseResultModel = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  type: CharacterizationTypeEnum;
  doneAt?: Date;
  order?: number;
  profiles: { id: string; name: string }[];
  hierarchies: { id: string; name: string; type: HierarchyTypeEnum }[];
  risks: { id: string; name: string }[];
  photos: { id: string; url: string }[];
  stage?: { name: string; color?: string };
};

export class CharacterizationBrowseResultModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  type: CharacterizationTypeEnum;
  doneAt?: Date;
  order: string;
  profiles: { id: string; name: string }[];
  hierarchies: { id: string; name: string; type: HierarchyTypeEnum }[];
  risks: { id: string; name: string }[];
  photos: { id: string; url: string }[];
  stage?: { name: string; color?: string };

  constructor(params: ICharacterizationBrowseResultModel) {
    this.id = params.id;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.name = params.name;
    this.type = params.type;
    this.doneAt = params.doneAt;
    this.order = String(params.order || '-');

    this.profiles = params.profiles;
    this.hierarchies = params.hierarchies;
    this.risks = params.risks;
    this.photos = params.photos;
    this.stage = params.stage;
  }

  get formatedCreatedAt() {
    return {
      date: dateUtils(this.createdAt).format('DD/MM/YYYY'),
      fullTime: dateUtils(this.createdAt).format('DD/MM/YYYY HH:MM'),
    };
  }

  get formatedUpdatedAt() {
    return {
      date: dateUtils(this.updatedAt).format('DD/MM/YYYY'),
      fullTime: dateUtils(this.updatedAt).format('DD/MM/YYYY HH:MM'),
    };
  }

  get formatedDoneAt() {
    return this.doneAt ? dateUtils(this.doneAt).format('DD/MM/YYYY HH:MM') : '';
  }
}
