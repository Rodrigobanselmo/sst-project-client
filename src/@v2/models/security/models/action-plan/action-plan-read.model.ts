import { ActionPlanStatusEnum } from '../../enums/action-plan-status.enum';
import { EffectivenessStatusEnum } from '../../enums/effectiveness-status.enum';
import { OriginTypeEnum } from '../../enums/origin-type.enum';
import { originTypeTranslation } from '../../translations/origin-type.translation';
import { ActionPlanReadPhotoModel } from './action-plan-read-photo.model';
import {
  ActionPlanEffectivenessModel,
  IActionPlanEffectivenessModel,
} from './action-plan-effectiveness.model';
import {
  ActionPlanPlanningModel,
  IActionPlanPlanningModel,
} from './action-plan-planning.model';

export type IActionPlanReadModel = {
  uuid: {
    id?: string;
    riskDataId: string;
    recommendationId: string;
    workspaceId: string;
  };
  companyId: string;
  name: string;
  type: OriginTypeEnum;
  status: ActionPlanStatusEnum;
  validDate: Date | null;
  responsible: { id: string; name: string } | null;

  characterizationPhotos: ActionPlanReadPhotoModel[];
  recommendation: {
    name: string;
    photos: ActionPlanReadPhotoModel[];
  };
  generateSources: {
    id: string;
    name: string;
  }[];
  planning?: IActionPlanPlanningModel;
  effectiveness?: IActionPlanEffectivenessModel;
};

export class ActionPlanReadModel {
  uuid: {
    id?: string;
    riskDataId: string;
    recommendationId: string;
    workspaceId: string;
  };
  companyId: string;
  name: string;
  type: OriginTypeEnum;
  status: ActionPlanStatusEnum;
  validDate: Date | null;
  responsible: { id: string; name: string } | null;

  characterizationPhotos: ActionPlanReadPhotoModel[];
  recommendation: {
    name: string;
    photos: ActionPlanReadPhotoModel[];
  };
  generateSources: {
    id: string;
    name: string;
  }[];
  planning: ActionPlanPlanningModel;
  effectiveness: ActionPlanEffectivenessModel;

  constructor(params: IActionPlanReadModel) {
    this.uuid = params.uuid;
    this.name = params.name;
    this.type = params.type;
    this.companyId = params.companyId;
    this.status = params.status ?? ActionPlanStatusEnum.PENDING;
    this.validDate = params.validDate ? new Date(params.validDate) : null;
    this.responsible = params.responsible ?? null;

    this.recommendation = {
      name: params.recommendation?.name ?? '',
      photos: params.recommendation?.photos ?? [],
    };
    this.generateSources = (params.generateSources ?? []).map((source) => ({
      id: source.id,
      name: source.name.replaceAll('**', ''),
    }));
    this.characterizationPhotos = params.characterizationPhotos ?? [];
    this.planning = new ActionPlanPlanningModel(
      params.planning ?? { monitoringMethod: null, resultCriteria: null },
    );
    this.effectiveness = new ActionPlanEffectivenessModel(
      params.effectiveness ?? {
        status: EffectivenessStatusEnum.NOT_EVALUATED,
        date: null,
        comment: null,
        evaluatedBy: null,
      },
    );
  }

  get originType() {
    return originTypeTranslation[this.type];
  }

  get recommendationPhotos() {
    return this.recommendation.photos;
  }
}
