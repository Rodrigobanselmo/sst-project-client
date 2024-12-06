import { WorkspaceBrowseFilterModel } from './workspace-browse-all-filter.model';
import { WorkspaceBrowseResultModel } from './workspace-browse-all-result.model';

export type IWorkspaceBrowseModel = {
  results: WorkspaceBrowseResultModel[];
  filters: WorkspaceBrowseFilterModel;
};

export class WorkspaceBrowseModel {
  results: WorkspaceBrowseResultModel[];
  filters: WorkspaceBrowseFilterModel;

  constructor(params: WorkspaceBrowseModel) {
    this.results = params.results.map(
      (result) => new WorkspaceBrowseResultModel(result),
    );
    this.filters = new WorkspaceBrowseFilterModel(params.filters);
  }
}
