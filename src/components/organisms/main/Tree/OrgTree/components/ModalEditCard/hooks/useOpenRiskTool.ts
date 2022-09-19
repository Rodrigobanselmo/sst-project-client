import { useMemo } from 'react';

import { initialRiskToolState } from 'components/organisms/modals/ModalRiskTool/hooks/useModalRiskTool';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IGho } from 'core/interfaces/api/IGho';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { ITreeSelectedItem } from '../../../interfaces';
import { useOpenRiskTool } from '../../RiskTool/hooks/useOpenRiskTool';
import { ViewsDataEnum } from '../../RiskTool/utils/view-data-type.constant';
import { ViewTypeEnum } from '../../RiskTool/utils/view-risk-type.constant';

export const useModalCardActions = ({
  selectedNode,
  riskGroupId,
  hierarchyId,
}: {
  selectedNode: ITreeSelectedItem | null;
  riskGroupId: string;
  hierarchyId: string;
}) => {
  const { onOpenSelected } = useOpenRiskTool();
  const { onStackOpenModal } = useModal();

  const onOpenRiskTool = (
    homogeneousGroup: IGho | undefined,
    riskFactor: IRiskFactors,
  ) => {
    const foundGho = homogeneousGroup;

    let viewData = ViewsDataEnum.CHARACTERIZATION;
    let ghoName = foundGho?.name;

    switch (foundGho?.type) {
      case HomoTypeEnum.HIERARCHY:
        viewData = ViewsDataEnum.HIERARCHY;
        ghoName = selectedNode?.label || selectedNode?.name;
        break;
      case (HomoTypeEnum.GSE, undefined, null):
        viewData = ViewsDataEnum.GSE;
        ghoName = foundGho?.name;
        break;
      case HomoTypeEnum.ENVIRONMENT:
        viewData = ViewsDataEnum.ENVIRONMENT;
        ghoName = foundGho?.description?.split('(//)')[0];
        break;

      default:
        viewData = ViewsDataEnum.CHARACTERIZATION;
        ghoName = foundGho?.description?.split('(//)')[0];
        break;
    }

    if (foundGho)
      setTimeout(() => {
        onOpenSelected({
          viewData,
          viewType: ViewTypeEnum.SIMPLE_BY_RISK,
          ghoId: foundGho.id,
          ghoName: ghoName || '',
          risks: [riskFactor],
          filterKey: 'probability',
          filterValue: 'desc',
        });
      }, 500);

    onStackOpenModal(ModalEnum.RISK_TOOL, { riskGroupId } as Partial<
      typeof initialRiskToolState
    >);
  };

  const onOpenOfficeRiskTool = () => {
    if (hierarchyId)
      setTimeout(() => {
        onOpenSelected({
          viewData: ViewsDataEnum.HIERARCHY,
          viewType: ViewTypeEnum.SIMPLE_BY_GROUP,
          ghoId: hierarchyId,
          ghoName: selectedNode?.label || selectedNode?.name || '',
          risks: [],
        });
      }, 500);

    onStackOpenModal(ModalEnum.RISK_TOOL, { riskGroupId } as Partial<
      typeof initialRiskToolState
    >);
  };
  return { onOpenOfficeRiskTool, onOpenRiskTool };
};

export type IUseModalCardActions = ReturnType<typeof useModalCardActions>;
