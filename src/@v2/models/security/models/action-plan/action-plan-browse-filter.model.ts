import { ActionPlanStatusEnum } from '../../enums/action-plan-status.enum';
import { RiskTypeEnum } from '../../enums/risk-type.enum';

export type IActionPlanBrowseRiskFilterParams = Partial<
  Record<RiskTypeEnum, { id: number; name: string }[]>
>;

export type IActionPlanBrowseFilterModel = {
  status: ActionPlanStatusEnum[];
  workspaces: { id: string; name: string }[];
  riskTypes: IActionPlanBrowseRiskFilterParams;
};

export class ActionPlanBrowseFilterModel {
  status: ActionPlanStatusEnum[];
  workspaces: { id: string; name: string }[];
  riskTypes: IActionPlanBrowseRiskFilterParams;

  constructor(params: IActionPlanBrowseFilterModel) {
    this.status = params.status;
    this.workspaces = params.workspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
    }));
    this.riskTypes = params.riskTypes || {};
  }

  get listRiskTypes() {
    return Object.entries(this.riskTypes).map(([type, risks]) => ({
      type: type as RiskTypeEnum,
      subTypes: risks.map((risk) => ({ id: risk.id, name: risk.name })),
    }));
  }

  get listRiskSubTypes() {
    return this.listRiskTypes.reduce(
      (acc, { type, subTypes }) => {
        acc.push({ id: type, name: type });
        subTypes.forEach((subType) => {
          acc.push({ id: subType.id, name: subType.name });
        });
        return acc;
      },
      [] as { id: RiskTypeEnum | number; name: string }[],
    );
  }
}
