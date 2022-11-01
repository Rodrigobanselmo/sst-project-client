import React, { FC, useEffect, useMemo, useState } from 'react';

import { Box, Divider } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import {
  selectHierarchySearch,
  setAddModalId,
  setHierarchySearch,
  setModalIds,
  setRemoveModalId,
} from 'store/reducers/hierarchy/hierarchySlice';

import { SAddIcon } from 'assets/icons/SAddIcon';
import SCloseIcon from 'assets/icons/SCloseIcon';

import { hierarchyConstant } from 'core/constants/maps/hierarchy.constant';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import {
  IListHierarchyQuery,
  useListHierarchyQuery,
} from 'core/hooks/useListHierarchyQuery';
import { useModal } from 'core/hooks/useModal';
import { ICompany, IWorkspace } from 'core/interfaces/api/ICompany';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

import { initialHierarchySelectState } from '..';

import { initialAutomateSubOfficeState } from '../../ModalAutomateSubOffice/hooks/useHandleActions';
import { ModalInputHierarchy } from './ModalInputHierarchy';
import { ModalItemHierarchy } from './ModalItemHierarchy';
import { ModalListGHO } from './ModalListGHO';
import { STGridBox } from './styles';

export const ModalSelectHierarchyData: FC<{
  company: ICompany;
  selectedData: typeof initialHierarchySelectState;
  handleSingleSelect: (hierarchy: IListHierarchyQuery) => void;
}> = ({ company, selectedData, handleSingleSelect }) => {
  const { data: ghoQuery } = useQueryGHOAll();

  const dispatch = useAppDispatch();
  const { onStackOpenModal } = useModal();
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

  const { hierarchyListData } = useListHierarchyQuery();

  const hierarchyList = useMemo((): IListHierarchyQuery[] => {
    const typesSelected: Record<HierarchyEnum, boolean> = {} as Record<
      HierarchyEnum,
      boolean
    >;

    const list = hierarchyListData()
      .filter((hierarchy) => {
        (typesSelected as any)[hierarchy.type] = true;
        // eslint-disable-next-line prettier/prettier
      const isWorkspace = workspaceSelected && hierarchy.workspaceIds.includes(workspaceSelected?.id);
        // eslint-disable-next-line prettier/prettier
      const isToFilter = search && !stringNormalize(hierarchy.name).includes(stringNormalize(search));

        if (filter === 'GHO') return !isToFilter && isWorkspace;
        return (hierarchy as any).type === filter && !isToFilter && isWorkspace;
      })
      .map((hierarchy) => ({
        ...hierarchy,
        id: hierarchy.id + '//' + workspaceSelected?.id,
      }));

    setAllTypes(typesSelected);

    return list;
  }, [filter, hierarchyListData, search, workspaceSelected]);

  const hierarchyListSelected = useMemo(() => {
    return hierarchyListData().map((hierarchy) => ({
      ...hierarchy,
      id: hierarchy.id + '//' + workspaceSelected?.id,
    }));
  }, [hierarchyListData, workspaceSelected?.id]);

  const onSelectAll = () => {
    if (filter === 'GHO') {
      const hierarchyListIds = removeDuplicate(
        ghoQuery
          .map((gho) =>
            (gho.hierarchies || []).map(
              (hierarchy) => hierarchy.id + '//' + workspaceSelected?.id,
            ),
          )
          .reduce((acc, curr) => [...acc, ...curr], [] as string[]),
        {
          simpleCompare: true,
        },
      );

      const uniqueHierarchyList = hierarchyListIds.filter(
        (ghoHierarchyId) =>
          !!hierarchyList.find((hierarchy) => hierarchy.id === ghoHierarchyId),
      );

      return dispatch(setModalIds(uniqueHierarchyList));
    }
    dispatch(setModalIds(hierarchyList.map((hierarchy) => hierarchy.id)));
  };

  const onSelectWorkspace = (workspace: IWorkspace) => {
    if (selectedData.lockWorkspace) return;
    setWorkspaceSelected(workspace);
  };

  const onEmployeeAdd = () => {
    return onStackOpenModal(ModalEnum.AUTOMATE_SUB_OFFICE, {
      callback: (hierarchy) => {
        setTimeout(() => {
          setFilter(HierarchyEnum.SUB_OFFICE);
          setTimeout(() => {
            if (hierarchy?.id)
              document
                .getElementById(
                  IdsEnum.HIERARCHY_MODAL_SELECT_ITEM.replace(
                    ':id',
                    hierarchy.id,
                  ),
                )
                ?.click();
          }, 500);
        }, 500);
      },
    } as typeof initialAutomateSubOfficeState);
  };

  if (workspaceSelected === undefined) return null;

  return (
    <Box mt={8} maxHeight={'calc(95vh - 150px)'} overflow="auto">
      <SFlex direction="column" gap={5}>
        <SFlex gap={4} align="center">
          <SText mr={4}>Estabelecimento:</SText>
          {company?.workspace?.map((workspace) => (
            <STagButton
              bg={
                workspaceSelected.id === workspace.id ? 'info.main' : undefined
              }
              active={workspaceSelected.id === workspace.id}
              key={workspace.id}
              tooltipTitle={`filtar por ${workspace.name}`}
              text={workspace.name}
              large
              onClick={() => onSelectWorkspace(workspace)}
              disabled={selectedData.lockWorkspace}
            />
          ))}
        </SFlex>
        <SFlex gap={10} mt={10}>
          <Box flex={1}>
            <SFlex gap={4} align="center">
              <SText mr={4}>Adicinar</SText>
              <STagButton
                width="150px"
                text={'adicionar todos'}
                iconProps={{ sx: { color: 'success.main' } }}
                icon={SAddIcon}
                onClick={() => onSelectAll?.()}
              />
            </SFlex>
            <Divider sx={{ mb: 10, mt: 7 }} />
            <ModalInputHierarchy
              listFilter={allTypes}
              onEmployeeAdd={onEmployeeAdd}
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
            <SFlex direction="column" gap={5} mb={10}>
              {filter !== 'GHO' &&
                hierarchyList.map((hierarchy) => {
                  return (
                    <ModalItemHierarchy
                      onClick={() =>
                        selectedData.singleSelect
                          ? handleSingleSelect(hierarchy)
                          : dispatch(setAddModalId(hierarchy.id))
                      }
                      key={hierarchy.id}
                      id={IdsEnum.HIERARCHY_MODAL_SELECT_ITEM.replace(
                        ':id',
                        hierarchy.id.split('//')[0],
                      )}
                      data={hierarchy}
                    />
                  );
                })}{' '}
              {filter === 'GHO' && <ModalListGHO ghoQuery={ghoQuery} />}
            </SFlex>
          </Box>
          <Box flex={1}>
            <SFlex gap={4} align="center">
              <SText mr={4}>Selecionados</SText>
              <STagButton
                width="150px"
                text={'remover todos'}
                iconProps={{ sx: { color: 'error.main' } }}
                icon={SCloseIcon}
                onClick={() => dispatch(setModalIds([]))}
              />
            </SFlex>
            <Divider sx={{ mb: 10, mt: 7 }} />
            <SFlex direction="column" gap={5} mb={10}>
              {hierarchyListSelected.map((hierarchy) => {
                return (
                  <ModalItemHierarchy
                    onClick={() => dispatch(setRemoveModalId(hierarchy.id))}
                    active
                    key={hierarchy.id}
                    data={hierarchy}
                    activeRemove={true}
                  />
                );
              })}
            </SFlex>
          </Box>
        </SFlex>
      </SFlex>
    </Box>
  );
};
