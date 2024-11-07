import { CharacterizationTypeEnum } from '../../enums/characterization-type.enum';

export type IActionPlanBrowseFilterModel = {
  types: CharacterizationTypeEnum[];
  stages: { id: number; name: string; color?: string }[];
};

export class ActionPlanBrowseFilterModel {
  types: CharacterizationTypeEnum[];
  stages: { id: number; name: string; color?: string }[];

  constructor(params: IActionPlanBrowseFilterModel) {
    this.types = params.types;
    this.stages = params.stages;
  }
}
