import React, { FC, useCallback, useMemo } from 'react';

import clone from 'clone';
import { useRouter } from 'next/router';
import sortArray from 'sort-array';
import {
  selectGhoFilter,
  selectGhoId,
} from 'store/reducers/hierarchy/ghoSlice';
import { selectRisk } from 'store/reducers/hierarchy/riskAddSlice';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { QueryEnum } from 'core/enums/query.enums';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IGho } from 'core/interfaces/api/IGho';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';
import { useQueryRiskData } from 'core/services/hooks/queries/useQueryRiskData';
import { queryClient } from 'core/services/queryClient';
import { sortDate } from 'core/utils/sorts/data.sort';
import { sortFilter } from 'core/utils/sorts/filter.sort';
import { sortString } from 'core/utils/sorts/string.sort';

import { ViewsDataEnum } from '../../../../utils/view-data-type.constant';
import { SideRow } from '../../../SideRow';
import { RiskToolRiskViewProps } from './types';

export const RiskToolRiskGhoView: FC<RiskToolRiskViewProps> = ({
  handleDeleteGHO,
  handleEditGHO,
  handleSelectGHO,
  isDeleteLoading,
  viewDataType,
  riskGroupId,
  isRiskOpen,
}) => {
  const { data: ghoQuery } = useQueryGHOAll();
  const selectedGhoId = useAppSelector(selectGhoId);
  const selectedGhoFilter = useAppSelector(selectGhoFilter);

  const { companyId } = useGetCompanyId();

  const risk = useAppSelector(selectRisk);

  //! performance optimization here
  const { data: riskData } = useQueryRiskData(
    riskGroupId as string,
    risk?.id as string,
  );

  const getGhoList = useCallback(() => {
    if (!ghoQuery) return [];
    const ghoFilteredList = ghoQuery.filter((gho) => {
      if (viewDataType === ViewsDataEnum.GSE) return !gho.type;

      if (viewDataType === ViewsDataEnum.ENVIRONMENT) {
        return gho.type === HomoTypeEnum.ENVIRONMENT;
      }

      if (viewDataType === ViewsDataEnum.CHARACTERIZATION)
        return (
          gho?.type &&
          [
            HomoTypeEnum.WORKSTATION,
            HomoTypeEnum.EQUIPMENT,
            HomoTypeEnum.ACTIVITIES,
          ].includes(gho.type)
        );
    });

    if (!selectedGhoFilter.value || !selectedGhoFilter.key) {
      return sortArray(ghoFilteredList, { by: ['description'] });
    }

    const riskData = queryClient.getQueryData([
      QueryEnum.RISK_DATA,
      companyId,
      riskGroupId,
      risk?.id,
    ]) as IRiskData[];

    if (!riskData) return sortArray(ghoFilteredList, { by: ['description'] });
    if (riskData.length === 0)
      return sortArray(ghoFilteredList, { by: ['description'] });

    const ghoData = ghoFilteredList.map((gho) => {
      const riskDataFilters = riskData.map((rd) => {
        const copyItem = clone(rd) as Partial<IRiskData>;
        Object.entries(copyItem).map(([key, value]) => {
          if (Array.isArray(value)) (copyItem as any)[key] = value.length;
        });
        delete copyItem.id;

        return copyItem;
      });

      const foundAllRiskData = riskDataFilters.filter(
        (risk) => risk.homogeneousGroupId === gho.id,
      );

      const foundRiskData = foundAllRiskData?.[0];

      return {
        ...foundRiskData,
        allRiskData: foundAllRiskData,
        ...gho,
      };
    }) as IGho[];

    return sortArray(ghoData, { by: ['description'] }).sort((a, b) =>
      sortFilter(a, b, selectedGhoFilter.value, selectedGhoFilter.key),
    );
  }, [
    companyId,
    ghoQuery,
    risk?.id,
    riskGroupId,
    selectedGhoFilter.key,
    selectedGhoFilter.value,
    viewDataType,
  ]);

  const ghoOrderedData = useMemo(() => {
    const ghoList = getGhoList().map((g) => {
      const riskDataFound = riskData.find(
        (data) => data.homogeneousGroupId == g.id,
      );

      const newG = clone(g);

      if (riskData) newG.riskData = riskDataFound;

      return newG;
    });

    return sortArray(ghoList, {
      by: 'notEmpty',
      computed: {
        notEmpty: (gho) => {
          return !gho.riskData;
        },
      },
    });
  }, [getGhoList, riskData]);

  return (
    <>
      {ghoOrderedData.map((gho) => {
        return (
          <SideRow
            key={gho.id}
            viewDataType={viewDataType}
            gho={gho}
            handleEditGHO={handleEditGHO}
            handleSelectGHO={handleSelectGHO}
            handleDeleteGHO={handleDeleteGHO}
            selectedGhoId={selectedGhoId}
            isDeleteLoading={isDeleteLoading}
            isRiskOpen={isRiskOpen}
            riskGroupId={riskGroupId}
            riskDataAll={riskData
              .sort((a, b) => sortDate(b.endDate, a.endDate))
              .filter((data) => data.homogeneousGroupId == gho.id)}
          />
        );
      })}
    </>
  );
};

//  <Slide
//     direction="left"
//     in={isGhoOpen || isRiskOpen}
//     mountOnEnter
//     unmountOnExit
//   ></Slide>
