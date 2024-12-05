import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';

export type IHierarchiesTypesModel = {
  types: HierarchyTypeEnum[];
};

export class HierarchiesTypesModel {
  order = [
    HierarchyTypeEnum.DIRECTORY,
    HierarchyTypeEnum.MANAGEMENT,
    HierarchyTypeEnum.SECTOR,
    HierarchyTypeEnum.SUB_SECTOR,
    HierarchyTypeEnum.OFFICE,
    HierarchyTypeEnum.SUB_OFFICE,
  ];

  private _types: HierarchyTypeEnum[];

  constructor(params: IHierarchiesTypesModel) {
    this._types = params.types;
  }

  get types() {
    return this._types.sort(
      (a, b) => this.order.indexOf(a) - this.order.indexOf(b),
    );
  }
}
