import { CharacterizationTypeEnum } from '../../enums/characterization-type.enum';

export type ICharacterizationBrowseFilterModel = {
  types: CharacterizationTypeEnum[];
  stages: { id: number; name: string; color?: string }[];
};

export class CharacterizationBrowseFilterModel {
  types: CharacterizationTypeEnum[];
  stages: { id: number; name: string; color?: string }[];

  constructor(params: ICharacterizationBrowseFilterModel) {
    this.types = params.types;
    this.stages = params.stages;
  }
}
