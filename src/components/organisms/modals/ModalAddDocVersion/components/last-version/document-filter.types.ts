import { IGho } from 'core/interfaces/api/IGho';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';

import { ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';

export type DocumentFilterItem = IGho | IHierarchy;

export type DocumentFilterSelection = {
  selecteds: DocumentFilterItem[];
  viewDataType: ViewsDataEnum;
};

export const emptyDocumentFilterSelection = (
  viewDataType: ViewsDataEnum = ViewsDataEnum.HIERARCHY,
): DocumentFilterSelection => ({
  selecteds: [],
  viewDataType,
});
