import React, { FC, useCallback, useMemo } from 'react';

import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import { initialWorkspaceSelectState } from 'components/organisms/modals/ModalSelectWorkspace';
import { useRouter } from 'next/router';
import {
  selectGhoFilter,
  selectGhoId,
} from 'store/reducers/hierarchy/ghoSlice';

import { originRiskMap } from 'core/constants/maps/origin-risk';
import { CharacterizationEnum } from 'core/enums/characterization.enums';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useModal } from 'core/hooks/useModal';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryGHO } from 'core/services/hooks/queries/useQueryGHO';

import { GhoRow } from '../GhoRow';
import { RiskToolRiskViewProps } from './types';

export const GhoToolView: FC<RiskToolRiskViewProps> = ({
  handleDeleteGHO,
  handleEditGHO,
  handleSelectGHO,
  isDeleteLoading,
  filter,
  handleFilter,
}) => {
  const { data: ghoQuery } = useQueryGHO();
  const selectedGhoId = useAppSelector(selectGhoId);
  const selectedGhoFilter = useAppSelector(selectGhoFilter);
  const { data: company } = useQueryCompany();
  const { onOpenModal } = useModal();
  const { push } = useRouter();

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

    if (!selectedGhoFilter.value || !selectedGhoFilter.key) return ghoFilter;
    return ghoFilter;
  }, [ghoQuery, selectedGhoFilter.key, selectedGhoFilter.value]);

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

  const handleGoToCharacterization = useCallback(() => {
    const workspaceLength = company?.workspace?.length || 0;
    const goToEnv = (workId: string) => {
      push({
        pathname: `${RoutesEnum.CHARACTERIZATIONS.replace(
          ':companyId',
          company.id,
        ).replace(':workspaceId', workId)}/${CharacterizationEnum.ALL}`,
      });
    };

    if (workspaceLength != 1) {
      const initialWorkspaceState = {
        title: 'Selecione para qual Estabelecimento deseja adicionar',
        onSelect: (workspace: IWorkspace) => goToEnv(workspace.id),
      } as typeof initialWorkspaceSelectState;

      onOpenModal(ModalEnum.WORKSPACE_SELECT, initialWorkspaceState);
    }

    if (!company?.workspace) return;
    if (workspaceLength == 1) goToEnv(company.workspace[0].id);
  }, [company.id, company?.workspace, onOpenModal, push]);

  return (
    <>
      <SFlex flexWrap="wrap" align="center" gap={4} mb={5} width="280px">
        {ghoFilters.map((type) => (
          <STagButton
            onClick={() => handleFilter(type || null)}
            key={type}
            active={filter === type || (!filter && !type)}
            text={originRiskMap[type].name}
          />
        ))}
      </SFlex>
      {ghoOrderedData.map((gho, index) => {
        if (gho.type !== filter) return null;

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
      {filter && (
        <STagButton
          onClick={handleGoToCharacterization}
          width="285px"
          text={'adicionar '}
        />
      )}
    </>
  );
};

//  <Slide
//     direction="left"
//     in={isGhoOpen || isRiskOpen}
//     mountOnEnter
//     unmountOnExit
//   ></Slide>
