import React, { useMemo } from 'react';

import { LinearProgress } from '@mui/material';
import { initialRiskToolState } from 'components/organisms/modals/ModalRiskTool/hooks/useModalRiskTool';
import { RiskOrderEnum } from 'project/enum/risk.enums';

import { originRiskMap } from 'core/constants/maps/origin-risk';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { useModal } from 'core/hooks/useModal';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useQueryRiskDataByHierarchy } from 'core/services/hooks/queries/useQueryRiskDataByHierarchy';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';
import { sortNumber } from 'core/utils/sorts/number.sort';
import { sortString } from 'core/utils/sorts/string.sort';

import { ModalEnum } from '../../../../../../../../../core/enums/modal.enums';
import SFlex from '../../../../../../../../atoms/SFlex';
import SText from '../../../../../../../../atoms/SText';
import { ITreeSelectedItem } from '../../../../interfaces';
import { useOpenRiskTool } from '../../../RiskTool/hooks/useOpenRiskTool';
import { ViewsDataEnum } from '../../../RiskTool/utils/view-data-type.constant';
import { ViewTypeEnum } from '../../../RiskTool/utils/view-risk-type.constant';

interface IModalRiskDataViewProps {
  selectedNode: ITreeSelectedItem | null;
}

export const ModalViewRiskData = ({
  selectedNode,
}: IModalRiskDataViewProps) => {
  const hierarchyId = String(selectedNode?.id)?.split('//')[0];
  const { onStackOpenModal } = useModal();
  const { onOpenSelected } = useOpenRiskTool();

  const { data: riskGroupData, isLoading: loadingRiskGroup } =
    useQueryRiskGroupData();

  const riskGroupId = riskGroupData?.[riskGroupData.length - 1]?.id;

  const { data: riskDataHierarchy, isLoading: loadingRiskData } =
    useQueryRiskDataByHierarchy(riskGroupId, hierarchyId);

  const riskDataMemo = useMemo(() => {
    const risks: Record<
      string,
      { riskData: IRiskData[]; riskFactor: IRiskFactors }
    > = {};

    riskDataHierarchy.forEach((riskData) => {
      if (!risks[riskData.riskId])
        risks[riskData.riskId] = {
          riskData: [],
          riskFactor: riskData.riskFactor as IRiskFactors,
        };

      risks[riskData.riskId].riskData.push(riskData);
    });

    return Object.values(risks)
      .sort(({ riskFactor: a }, { riskFactor: b }) => sortString(a, b, 'name'))
      .sort(({ riskFactor: a }, { riskFactor: b }) =>
        sortNumber(
          RiskOrderEnum[a?.type || 'FIS'],
          RiskOrderEnum[b?.type || 'FIS'],
        ),
      );
  }, [riskDataHierarchy]);

  const onOpenRiskTool = (riskData: IRiskData, riskFactor: IRiskFactors) => {
    const foundGho = riskData.homogeneousGroup;

    let viewData = ViewsDataEnum.CHARACTERIZATION;
    let ghoName = foundGho?.name;

    switch (riskData.homogeneousGroup?.type) {
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

  return (
    <SFlex direction="column" minHeight={220}>
      {(loadingRiskGroup || loadingRiskData) && <LinearProgress />}

      {riskDataMemo.map((data) => {
        return (
          <SFlex
            gap={0}
            sx={{ cursor: 'pointer' }}
            direction="column"
            key={data.riskFactor.id}
          >
            <SFlex>
              <SText fontSize={14}>
                <SText
                  fontSize={10}
                  component="span"
                  sx={{
                    backgroundColor: `risk.${data.riskFactor?.type.toLowerCase()}`,
                    color: 'common.white',
                    display: 'inline-block',
                    width: '40px',
                    borderRadius: '4px',
                    mr: 1,
                  }}
                >
                  <SFlex center>{data.riskFactor?.type || ''}</SFlex>
                </SText>
                {data?.riskFactor?.name || ''}
              </SText>
            </SFlex>
            <SText lineHeight="1.4rem" fontSize={11} mt={0}>
              <b>Origem:</b>{' '}
              {data?.riskData.map((riskData) => (
                <SText
                  component="span"
                  key={riskData.id}
                  sx={{
                    borderRadius: '4px',
                    mr: 1,
                    backgroundColor: 'background.box',
                    px: 3,
                    py: '1px',
                    border: '1px solid',
                    borderColor: 'grey.400',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                  fontSize={11}
                  onClick={() => onOpenRiskTool(riskData, data.riskFactor)}
                >
                  {riskData.origin ||
                    `${selectedNode?.label || selectedNode?.name} (${
                      originRiskMap?.[(selectedNode?.type || '') as any]?.name
                    })` ||
                    ''}
                </SText>
              ))}
            </SText>
          </SFlex>
        );
      })}
    </SFlex>
  );
};
