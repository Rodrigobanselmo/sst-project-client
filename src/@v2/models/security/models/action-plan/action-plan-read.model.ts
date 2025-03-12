import { OriginTypeEnum } from '../../enums/origin-type.enum';
import { originTypeTranslation } from '../../translations/origin-type.translation';
import { ActionPlanReadPhotoModel } from './action-plan-read-photo.model';

export type IActionPlanReadModel = {
  id: string;
  companyId: string;
  name: string;
  type: OriginTypeEnum;

  recommendationPhotos: ActionPlanReadPhotoModel[];
  characterizationPhotos: ActionPlanReadPhotoModel[];
};

export class ActionPlanReadModel {
  id: string;
  companyId: string;
  name: string;
  type: OriginTypeEnum;

  recommendationPhotos: ActionPlanReadPhotoModel[];
  characterizationPhotos: ActionPlanReadPhotoModel[];

  constructor(params: IActionPlanReadModel) {
    this.id = params.id;
    this.name = params.name;
    this.type = params.type;
    this.companyId = params.companyId;

    this.recommendationPhotos = params.recommendationPhotos;
    this.characterizationPhotos = params.characterizationPhotos;
  }

  get originType() {
    return originTypeTranslation[this.type];
  }
}
