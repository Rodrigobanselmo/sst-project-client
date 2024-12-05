import { HierarchyTypeEnum } from '../../enums/hierarchy-type.enum';

// type IHierarchyParent = {
//   id: string;
//   name: string;
// };

export type IHierarchyBrowseResultModel = {
  id: string;
  name: string;
  type: HierarchyTypeEnum;

  // office?: IHierarchyParent;
  // sector?: IHierarchyParent;
  // subSector?: IHierarchyParent;
  // management?: IHierarchyParent;
  // directory?: IHierarchyParent;
};

export class ActionPlanHierarchyBrowseResultModel {
  id: string;
  name: string;
  type: HierarchyTypeEnum;

  // office?: IHierarchyParent;
  // sector?: IHierarchyParent;
  // subSector?: IHierarchyParent;
  // management?: IHierarchyParent;
  // directory?: IHierarchyParent;

  constructor(params: IHierarchyBrowseResultModel) {
    this.id = params.id;
    this.name = params.name;
    this.type = params.type;

    // this.office = params.office;
    // this.sector = params.sector;
    // this.subSector = params.subSector;
    // this.management = params.management;
    // this.directory = params.directory;
  }
}
