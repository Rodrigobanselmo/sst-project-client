import { FileModel } from '@v2/models/.shared/models/file.model';
import { dateUtils } from '@v2/utils/date-utils';

export type ISubTypeBrowseResultModel = {
  id: number;
  name: string;
};

export class SubTypeBrowseResultModel {
  id: number;
  name: string;

  constructor(params: ISubTypeBrowseResultModel) {
    this.id = params.id;
    this.name = params.name;
  }
}
