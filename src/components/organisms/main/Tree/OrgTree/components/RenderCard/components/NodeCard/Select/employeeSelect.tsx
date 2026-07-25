/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, MouseEvent, useMemo, useState } from 'react';

import { Box, BoxProps } from '@mui/material';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { selectAllHierarchyTreeNodes } from 'store/reducers/hierarchy/hierarchySlice';

import SEmployeeIcon from 'assets/icons/SEmployeeIcon';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';
import {
  IQueryEmployee,
  useQueryEmployees,
} from 'core/services/hooks/queries/useQueryEmployees';

import { TreeTypeEnum } from '../../../../../enums/tree-type.enums';
import { ITreeMapObject } from '../../../../../interfaces';
import { groupEmployeesByHierarchy } from '../../../../../utils/group-employees-by-hierarchy';

export interface EmployeeSelectCardProps extends BoxProps {
  node: ITreeMapObject;
}

const MAX_TOOLTIP_ITEMS = 80;

export const EmployeeSelectCard: FC<
  { children?: any } & EmployeeSelectCardProps
> = ({ node, ...boxProps }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const treeMap = useAppSelector(selectAllHierarchyTreeNodes);
  const { getPathById } = useHierarchyTreeActions();

  const count = node.employeesCount ?? 0;
  const hierarchyId = String(node.id).split('//')[0] || '';
  const isSubOffice = node.type === TreeTypeEnum.SUB_OFFICE;
  const isOffice = node.type === TreeTypeEnum.OFFICE;
  const isWorkspace = node.type === TreeTypeEnum.WORKSPACE;
  const isCompany = node.type === TreeTypeEnum.COMPANY;
  const isLeafOffice = isOffice || isSubOffice;

  const query = useMemo(() => {
    const base: IQueryEmployee = {
      disabled: !tooltipOpen || count <= 0,
    };

    if (isSubOffice) {
      base.hierarchySubOfficeId = hierarchyId;
      return base;
    }

    if (isOffice) {
      base.hierarchyId = hierarchyId;
      return base;
    }

    if (isWorkspace) {
      base.hierarchyWorkspaceId = String(node.id);
      return base;
    }

    if (isCompany) {
      return base;
    }

    base.hierarchyId = hierarchyId;
    base.hierarchyDescendants = true;
    return base;
  }, [
    count,
    hierarchyId,
    isCompany,
    isOffice,
    isSubOffice,
    isWorkspace,
    node.id,
    tooltipOpen,
  ]);

  const {
    data: employees,
    count: fetchedCount,
    isLoading,
  } = useQueryEmployees(
    1,
    query,
    Math.min(Math.max(count, 20), MAX_TOOLTIP_ITEMS),
  );

  const groups = useMemo(
    () =>
      groupEmployeesByHierarchy({
        employees,
        viewerNode: node,
        treeMap,
        getPathById,
      }),
    [employees, getPathById, node, treeMap],
  );

  if (count <= 0) return null;

  const remaining = Math.max(fetchedCount - employees.length, 0);

  const tooltipTitle = (
    <Box
      sx={{
        maxHeight: 260,
        overflowY: 'auto',
        minWidth: 200,
        maxWidth: 320,
        py: 0.5,
        pr: 0.5,
      }}
    >
      <SText
        fontSize={12}
        sx={{ fontWeight: 700, mb: 1.25, lineHeight: 1.2, color: '#fff' }}
      >
        Funcionários vinculados
      </SText>
      {isLoading && (
        <SText fontSize={12} sx={{ color: '#fff' }}>
          Carregando...
        </SText>
      )}
      {!isLoading && isLeafOffice &&
        employees.map((employee) => (
          <SText
            key={employee.id}
            fontSize={12}
            sx={{ display: 'block', lineHeight: 1.35, py: 0.25, color: '#fff' }}
          >
            {employee.name}
          </SText>
        ))}
      {!isLoading &&
        !isLeafOffice &&
        groups.map((group, groupIndex) => (
          <Box
            key={group.key}
            sx={{
              mb: groupIndex < groups.length - 1 ? 1.5 : 0,
              pt: groupIndex > 0 ? 0.5 : 0,
              borderTop:
                groupIndex > 0 ? '1px solid rgba(255,255,255,0.18)' : 'none',
            }}
          >
            {!!group.title && (
              <SText
                fontSize={11}
                sx={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  lineHeight: 1.3,
                  mb: 0.5,
                  mt: groupIndex > 0 ? 1 : 0,
                  color: '#fff',
                  textTransform: 'uppercase',
                }}
              >
                {group.title} ({group.count})
              </SText>
            )}
            {group.employees.map((employee) => (
              <SText
                key={employee.id}
                fontSize={12}
                sx={{
                  display: 'block',
                  lineHeight: 1.35,
                  py: 0.25,
                  color: '#fff',
                  pl: 0.5,
                }}
              >
                {employee.name}
              </SText>
            ))}
          </Box>
        ))}
      {!isLoading && remaining > 0 && (
        <SText fontSize={11} sx={{ mt: 1, opacity: 0.85, color: '#fff' }}>
          + {remaining} funcionários
        </SText>
      )}
      {!isLoading && employees.length === 0 && (
        <SText fontSize={12} sx={{ color: '#fff' }}>
          Nenhum funcionário encontrado
        </SText>
      )}
    </Box>
  );

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <Box {...boxProps} onClick={handleClick}>
      <STooltip
        title={tooltipTitle}
        placement="top"
        withWrapper
        enterDelay={200}
        leaveDelay={100}
        onOpen={() => setTooltipOpen(true)}
        onClose={() => setTooltipOpen(false)}
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: 'grey.800',
              maxWidth: 340,
            },
          },
        }}
      >
        <STagButton
          text={String(count)}
          icon={SEmployeeIcon}
          onClick={handleClick}
          sx={{
            minWidth: 26,
            maxWidth: 44,
            height: 22,
            pl: '4px',
            pr: '6px',
            borderRadius: '11px',
            '& .icon_main': {
              mr: '4px',
              fontSize: '13px !important',
            },
          }}
        />
      </STooltip>
    </Box>
  );
};
