import { WorkspaceBrowseFilterModel } from './workspace-browse-all-filter.model';
import { WorkspaceBrowseResultModel } from './workspace-browse-all-result.model';

export type IWorkspaceBrowseModel = {
  results: WorkspaceBrowseResultModel[];
  filters: WorkspaceBrowseFilterModel;
};

export class WorkspaceBrowseModel {
  results: WorkspaceBrowseResultModel[];
  filters: WorkspaceBrowseFilterModel;

  constructor(params: IWorkspaceBrowseModel) {
    this.results = params.results.map(
      (result) => new WorkspaceBrowseResultModel(result),
    );
    this.filters = new WorkspaceBrowseFilterModel(params.filters);
  }

  get shortResults() {
    return this.results.map((result) => ({
      id: result.id,
      name: result.name,
    }));
  }
}
