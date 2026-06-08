import { EffectivenessStatusEnum } from '../../enums/effectiveness-status.enum';

export type IActionPlanEffectivenessModel = {
  status: EffectivenessStatusEnum;
  date: Date | null;
  comment: string | null;
  evaluatedBy: { id: string; name: string } | null;
};

export class ActionPlanEffectivenessModel {
  status: EffectivenessStatusEnum;
  date: Date | null;
  comment: string | null;
  evaluatedBy: { id: string; name: string } | null;

  constructor(params: IActionPlanEffectivenessModel) {
    this.status = params.status ?? EffectivenessStatusEnum.NOT_EVALUATED;
    this.date = params.date ? new Date(params.date) : null;
    this.comment = params.comment ?? null;
    this.evaluatedBy = params.evaluatedBy ?? null;
  }
}
