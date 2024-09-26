import { CharacterizationTypeEnum } from '../../enums/characterization-type.enum';

export type ICharacterizationBrowseFilterModel = {
  types: CharacterizationTypeEnum[];
};

export class CharacterizationBrowseFilterModel {
  types: CharacterizationTypeEnum[];

  constructor(params: ICharacterizationBrowseFilterModel) {
    this.types = params.types;
  }
}
