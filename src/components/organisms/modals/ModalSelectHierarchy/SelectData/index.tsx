import React, { FC, useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { useListHierarchy } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/hooks/useListHierarchy';
import {
  selectHierarchySearch,
  setAddModalId,
  setHierarchySearch,
  setModalIds,
  setRemoveModalId,
} from 'store/reducers/hierarchy/hierarchySlice';

import { hierarchyConstant } from 'core/constants/maps/hierarchy.constant';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { ICompany, IWorkspace } from 'core/interfaces/api/ICompany';
import { useQueryGHO } from 'core/services/hooks/queries/useQueryGHO';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

import { ModalInputHierarchy } from './ModalInputHierarchy';
import { ModalItemHierarchy } from './ModalItemHierarchy';
import { ModalListGHO } from './ModalListGHO';
import { STGridBox } from './styles';

import { initialHierarchySelectState } from '..';

export const ModalSelectHierarchyData: FC<{
  company: ICompany;
  selectedData: typeof initialHierarchySelectState;
  handleSingleSelect: (id: string) => void;
}> = ({ company, selectedData, handleSingleSelect }) => {
  const { data: ghoQuery } = useQueryGHO();

  const dispatch = useAppDispatch();
  const search = useAppSelector(selectHierarchySearch);
  const [workspaceSelected, setWorkspaceSelected] = useState(
    company?.workspace?.find(
      (workspace) => workspace.id === selectedData.workspaceId,
    ),
  );

  const showGho = selectedData.selectByGHO && ghoQuery.length;

  const [filter, setFilter] = useState<HierarchyEnum | 'GHO'>(
    showGho ? 'GHO' : HierarchyEnum.OFFICE,
  );
  const [allTypes, setAllTypes] = useState<Record<HierarchyEnum, boolean>>(
    {} as Record<HierarchyEnum, boolean>,
  );

  useEffect(() => {
    if (showGho) setFilter('GHO');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ghoQuery]);

  useEffect(() => {
    dispatch(setModalIds(selectedData.hierarchiesIds));
  }, [workspaceSelected?.name, dispatch, selectedData.hierarchiesIds]);

  const { hierarchyListData } = useListHierarchy();

  const hierarchyList = useMemo(() => {
    const typesSelected: Record<HierarchyEnum, boolean> = {} as Record<
      HierarchyEnum,
      boolean
    >;

    const list = hierarchyListData().filter((hierarchy) => {
      (typesSelected as any)[hierarchy.type] = true;
      // eslint-disable-next-line prettier/prettier
      const isWorkspace = hierarchy.parentsName.split(' > ')[0] === workspaceSelected?.name;
      // eslint-disable-next-line prettier/prettier
      const isToFilter = search && !stringNormalize(hierarchy.name).includes(stringNormalize(search));

      if (filter === 'GHO') return !isToFilter && isWorkspace;
      return (hierarchy as any).type === filter && !isToFilter && isWorkspace;
    });

    setAllTypes(typesSelected);
    return list;
  }, [filter, hierarchyListData, search, workspaceSelected?.name]);

  const hierarchyListSelected = useMemo(() => {
    return hierarchyListData();
  }, [hierarchyListData]);

  const onSelectAll = () => {
    dispatch(setModalIds(hierarchyList.map((hierarchy) => hierarchy.id)));
  };

  const onSelectWorkspace = (workspace: IWorkspace) => {
    if (selectedData.lockWorkspace) return;
    setWorkspaceSelected(workspace);
  };

  if (workspaceSelected === undefined) return null;

  return (
    <Box mt={8} maxHeight={'calc(95vh - 150px)'} overflow="auto">
      <SFlex direction="column" gap={5}>
        <SFlex gap={4} align="center">
          <SText mr={4}>Estabelecimento:</SText>
          {company?.workspace?.map((workspace) => (
            <STagButton
              bg={'info.main'}
              active={workspaceSelected.id === workspace.id}
              key={workspace.id}
              tooltipTitle={`filtar por ${workspace.name}`}
              text={workspace.name}
              large
              onClick={() => onSelectWorkspace(workspace)}
              disabled={selectedData.lockWorkspace}
            />
          ))}
          <STagButton
            ml="auto"
            mr={10}
            text={'remover todos'}
            large
            onClick={() => dispatch(setModalIds([]))}
          />
        </SFlex>
        <STGridBox mb={10}>
          {hierarchyListSelected.map((hierarchy) => {
            return (
              <ModalItemHierarchy
                onClick={() => dispatch(setRemoveModalId(hierarchy.id))}
                active
                key={hierarchy.id}
                data={hierarchy}
              />
            );
          })}
        </STGridBox>
        <ModalInputHierarchy
          listFilter={allTypes}
          onSearch={(value) => dispatch(setHierarchySearch(value))}
          placeholder={
            filter === 'GHO'
              ? 'Nome do GSE...'
              : hierarchyConstant[filter].placeholder
          }
          setFilter={(value) => setFilter(value)}
          filter={filter}
          onSelectAll={onSelectAll}
          selectedData={selectedData}
        />
        <STGridBox>
          {filter !== 'GHO' &&
            hierarchyList.map((hierarchy) => {
              return (
                <ModalItemHierarchy
                  onClick={() =>
                    selectedData.singleSelect
                      ? handleSingleSelect(hierarchy.id)
                      : dispatch(setAddModalId(hierarchy.id))
                  }
                  key={hierarchy.id}
                  data={hierarchy}
                />
              );
            })}{' '}
          {filter === 'GHO' && <ModalListGHO ghoQuery={ghoQuery} />}
        </STGridBox>
      </SFlex>
    </Box>
  );
};
