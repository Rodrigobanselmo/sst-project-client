import { FormApplicationStatusEnum } from '../../enums/form-status.enum';

export type IFormApplicationBrowseFilterModel = {
  status: FormApplicationStatusEnum[];
};

export class FormApplicationBrowseFilterModel {
  status: FormApplicationStatusEnum[];

  constructor(params: IFormApplicationBrowseFilterModel) {
    this.status = params.status || [];
  }
}
