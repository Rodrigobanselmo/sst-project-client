import { dateUtils } from '@v2/utils/date-utils';
import { CharacterizationTypeEnum } from '../../enums/characterization-type.enum';
import { HierarchyTypeEnum } from '../../enums/hierarchy-type.enum';
import { IRiskLevelValues } from '../../types/risk-level-values.type';
import { RecommendationTypeEnum } from '../../enums/recommendation-type.enum';
import { RiskTypeEnum } from '../../enums/risk-type.enum';
import { OriginTypeEnum } from '../../enums/origin-type.enum';
import { ActionPlanStatusEnum } from '../../enums/action-plan-status.enum';
import { originTypeTranslation } from '../../translations/origin-type.translation';

export type IActionPlanBrowseResultModel = {
  uuid: { riskDataId: string; recommendationId: string; workspaceId: string };
  createdAt: Date;
  updatedAt: Date | null;
  startDate: Date | null;
  doneDate: Date | null;
  canceledDate: Date | null;
  validDate: Date | null;
  ocupationalRisk: IRiskLevelValues | null;
  recommendation: { name: string; type: RecommendationTypeEnum };
  generateSources: { id: string; name: string }[];
  risk: { id: string; name: string; type: RiskTypeEnum };
  origin: { name: string; type: OriginTypeEnum };
  status: ActionPlanStatusEnum;
  hierarchies: { name: string; type: HierarchyTypeEnum }[];
  responsible: { id: string; name: string } | null;
};

export class ActionPlanBrowseResultModel {
  uuid: { riskDataId: string; recommendationId: string; workspaceId: string };
  createdAt: Date;
  updatedAt: Date | null;
  startDate: Date | null;
  doneDate: Date | null;
  canceledDate: Date | null;
  validDate: Date | null;
  ocupationalRisk: IRiskLevelValues;
  recommendation: { name: string; type: RecommendationTypeEnum };
  generateSource: { id: string; name: string }[];
  risk: { id: string; name: string; type: RiskTypeEnum };
  origin: { name: string; type: OriginTypeEnum };
  status: ActionPlanStatusEnum;
  hierarchies: { name: string; type: HierarchyTypeEnum }[];
  responsible: { id: string; name: string } | null;

  directories: { name: string; type: HierarchyTypeEnum }[] = [];
  managers: { name: string; type: HierarchyTypeEnum }[] = [];
  sectors: { name: string; type: HierarchyTypeEnum }[] = [];
  subSectors: { name: string; type: HierarchyTypeEnum }[] = [];
  offices: { name: string; type: HierarchyTypeEnum }[] = [];
  subOffices: { name: string; type: HierarchyTypeEnum }[] = [];

  constructor(params: IActionPlanBrowseResultModel) {
    this.uuid = params.uuid;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.startDate = params.startDate;
    this.doneDate = params.doneDate;
    this.canceledDate = params.canceledDate;
    this.ocupationalRisk = params.ocupationalRisk || 0;
    this.status = params.status;
    this.validDate = params.validDate ? new Date(params.validDate) : null;
    this.generateSource = params.generateSources;
    this.recommendation = params.recommendation;
    this.risk = params.risk;
    this.responsible = params.responsible;
    this.hierarchies = params.hierarchies;
    this.origin = params.origin;

    this.hierarchies.forEach((hierarchy) => {
      switch (hierarchy.type) {
        case HierarchyTypeEnum.DIRECTORY:
          this.directories = this.directories || [];
          this.directories.push(hierarchy);
          break;
        case HierarchyTypeEnum.MANAGEMENT:
          this.managers = this.managers || [];
          this.managers.push(hierarchy);
          break;
        case HierarchyTypeEnum.SECTOR:
          this.sectors = this.sectors || [];
          this.sectors.push(hierarchy);
          break;
        case HierarchyTypeEnum.SUB_SECTOR:
          this.subSectors = this.subSectors || [];
          this.subSectors.push(hierarchy);
          break;
        case HierarchyTypeEnum.OFFICE:
          this.offices = this.offices || [];
          this.offices.push(hierarchy);
          break;
        case HierarchyTypeEnum.SUB_OFFICE:
          this.subOffices = this.subOffices || [];
          this.subOffices.push(hierarchy);
          break;
      }
    });
  }

  get formatedDoneAt() {
    return this.validDate
      ? dateUtils(this.validDate).format('DD/MM/YYYY')
      : 'SEM PRAZO';
  }

  get formatedCreatedAt() {
    return dateUtils(this.createdAt).format('DD/MM/YYYY');
  }

  get formatedUpdatedAt() {
    return this.updatedAt
      ? dateUtils(this.updatedAt).format('DD/MM/YYYY')
      : this.formatedCreatedAt;
  }

  get id() {
    return (
      this.uuid.riskDataId + this.uuid.recommendationId + this.uuid.workspaceId
    );
  }

  get originType() {
    return originTypeTranslation[this.origin.type];
  }

  get generateSourceNames() {
    return this.generateSource.map((source) => source.name).join(', ');
  }
}
