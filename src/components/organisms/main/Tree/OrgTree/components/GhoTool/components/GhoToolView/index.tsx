import React, { FC, useEffect, useMemo } from 'react';

import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import { useRouter } from 'next/router';
import { selectGhoId } from 'store/reducers/hierarchy/ghoSlice';

import { originRiskMap } from 'core/constants/maps/origin-risk';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';

import { GhoRow } from '../GhoRow';
import { RiskToolRiskViewProps } from './types';

export const GhoToolView: FC<{ children?: any } & RiskToolRiskViewProps> = ({
  handleDeleteGHO,
  handleEditGHO,
  handleSelectGHO,
  isDeleteLoading,
  filter,
  handleFilter,
}) => {
  const { data: ghoQuery } = useQueryGHOAll();
  const selectedGhoId = useAppSelector(selectGhoId);
  const { pathname, query } = useRouter();

  const isOrgHierarquiaContext =
    pathname.includes('/empresas/') && pathname.includes('/hierarquia');
  const tabWorkspaceId = isOrgHierarquiaContext
    ? (query.tabWorkspaceId as string | undefined)
    : undefined;

  const disableNonGseTabs = isOrgHierarquiaContext && !tabWorkspaceId;

  useEffect(() => {
    if (
      isOrgHierarquiaContext &&
      !tabWorkspaceId &&
      filter != null &&
      filter !== HomoTypeEnum.GSE
    ) {
      handleFilter(HomoTypeEnum.GSE);
    }
  }, [filter, handleFilter, isOrgHierarquiaContext, tabWorkspaceId]);

  const ghoOrderedData = useMemo(() => {
    if (!ghoQuery) return [];
    const ghoFilter = ghoQuery.map((gho) => {
      if (!gho.type) return gho;
      const name = gho.description.split('(//)')[0];
      const type = gho.description.split('(//)')[1];

      if (gho.type === HomoTypeEnum.ENVIRONMENT && type && originRiskMap[type])
        return {
          ...gho,
          name: `${name} (${originRiskMap[type].name})`,
        };

      return {
        ...gho,
        name,
      };
    });

    if (isOrgHierarquiaContext && tabWorkspaceId) {
      return ghoFilter.filter(
        (gho) =>
          gho.workspaceIds?.includes(tabWorkspaceId) ||
          !!gho.workspaces?.some((w) => w.id === tabWorkspaceId),
      );
    }

    return ghoFilter;
  }, [ghoQuery, isOrgHierarquiaContext, tabWorkspaceId]);

  const ghoFilters = useMemo(() => {
    if (!ghoQuery) return [];

    const ghoFilters = Object.values(HomoTypeEnum)
      .map(
        (type) =>
          originRiskMap[type] &&
          !!ghoQuery.find((gho) => gho.type === type) &&
          type,
      )
      .filter((i) => !!i) as HomoTypeEnum[];

    return [HomoTypeEnum.GSE, ...ghoFilters];
  }, [ghoQuery]);

  return (
    <>
      <SFlex flexWrap="wrap" align="center" gap={4} mb={5} width="280px">
        {ghoFilters.map((type) => {
          const isGseTab = type === HomoTypeEnum.GSE;
          const tabDisabled = disableNonGseTabs && !isGseTab;
          return (
            <STagButton
              onClick={() => {
                if (tabDisabled) return;
                handleFilter(type || null);
              }}
              key={String(type)}
              active={filter === type || (!filter && !type)}
              text={originRiskMap[type].name}
              disabled={tabDisabled}
              tooltipTitle={
                tabDisabled
                  ? 'Selecione um estabelecimento no cabeçalho para listar e vincular ambientes e atividades a este organograma.'
                  : undefined
              }
            />
          );
        })}
      </SFlex>
      {ghoOrderedData.map((gho, index) => {
        if (gho.type !== filter && !selectedGhoId) return null;

        return (
          <GhoRow
            key={gho.id}
            gho={gho}
            handleEditGHO={!gho.type ? handleEditGHO : undefined}
            handleSelectGHO={handleSelectGHO}
            handleDeleteGHO={handleDeleteGHO}
            selectedGhoId={selectedGhoId}
            isDeleteLoading={isDeleteLoading}
            isFirst={index === 0}
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
