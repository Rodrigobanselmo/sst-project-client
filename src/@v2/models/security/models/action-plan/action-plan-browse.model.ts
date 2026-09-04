import {
  IPaginationModelConstructor,
  PaginationModel,
} from '@v2/models/.shared/models/pagination.model';
import { ActionPlanBrowseViewEnum } from '../../enums/action-plan-browse-view.enum';
import {
  ActionPlanBrowseFilterModel,
  IActionPlanBrowseFilterModel,
} from './action-plan-browse-filter.model';
import {
  ActionPlanBrowseGroupModel,
  IActionPlanBrowseGroupModel,
} from './action-plan-browse-group.model';
import {
  ActionPlanBrowseResultModel,
  IActionPlanBrowseResultModel,
} from './action-plan-browse-result.model';

export type IActionPlanBrowseTotals = {
  acoes: number;
  vinculos: number;
};

export type IActionPlanBrowseModel = {
  results: IActionPlanBrowseResultModel[];
  groups?: IActionPlanBrowseGroupModel[];
  pagination: IPaginationModelConstructor;
  filters: IActionPlanBrowseFilterModel;
  totals?: IActionPlanBrowseTotals;
  view?: ActionPlanBrowseViewEnum;
};

export class ActionPlanBrowseModel {
  results: ActionPlanBrowseResultModel[];
  groups: ActionPlanBrowseGroupModel[];
  pagination: PaginationModel;
  filters: ActionPlanBrowseFilterModel;
  totals: IActionPlanBrowseTotals;
  view: ActionPlanBrowseViewEnum;

  constructor(params: IActionPlanBrowseModel) {
    this.results = params.results.map(
      (result) => new ActionPlanBrowseResultModel(result),
    );
    this.groups = (params.groups ?? []).map(
      (group) => new ActionPlanBrowseGroupModel(group),
    );
    this.pagination = new PaginationModel(params.pagination);
    this.filters = new ActionPlanBrowseFilterModel(params.filters);
    this.view = params.view ?? ActionPlanBrowseViewEnum.LINKS;
    this.totals = params.totals ?? {
      acoes: this.view === ActionPlanBrowseViewEnum.GROUPED
        ? params.pagination.total
        : params.pagination.total,
      vinculos: params.pagination.total,
    };
  }
}
