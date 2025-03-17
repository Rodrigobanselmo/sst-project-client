import { OriginTypeEnum } from '../../enums/origin-type.enum';
import { originTypeTranslation } from '../../translations/origin-type.translation';
import { ActionPlanReadPhotoModel } from './action-plan-read-photo.model';

export type IActionPlanReadModel = {
  uuid: { riskDataId: string; recommendationId: string; workspaceId: string };
  companyId: string;
  name: string;
  type: OriginTypeEnum;

  characterizationPhotos: ActionPlanReadPhotoModel[];
  recommendation: {
    name: string;
    photos: ActionPlanReadPhotoModel[];
  };
};

export class ActionPlanReadModel {
  uuid: { riskDataId: string; recommendationId: string; workspaceId: string };
  companyId: string;
  name: string;
  type: OriginTypeEnum;

  characterizationPhotos: ActionPlanReadPhotoModel[];
  recommendation: {
    name: string;
    photos: ActionPlanReadPhotoModel[];
  };

  constructor(params: IActionPlanReadModel) {
    this.uuid = params.uuid;
    this.name = params.name;
    this.type = params.type;
    this.companyId = params.companyId;

    this.recommendation = params.recommendation;
    this.characterizationPhotos = params.characterizationPhotos;
  }

  get originType() {
    return originTypeTranslation[this.type];
  }

  get recommendationPhotos() {
    return this.recommendation.photos;
  }
}
