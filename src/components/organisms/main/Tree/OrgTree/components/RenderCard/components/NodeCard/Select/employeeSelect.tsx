/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, MouseEvent, useMemo, useState } from 'react';

import { Box, BoxProps } from '@mui/material';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import SEmployeeIcon from 'assets/icons/SEmployeeIcon';

import {
  IQueryEmployee,
  useQueryEmployees,
} from 'core/services/hooks/queries/useQueryEmployees';

import { TreeTypeEnum } from '../../../../../enums/tree-type.enums';
import { ITreeMapObject } from '../../../../../interfaces';

export interface EmployeeSelectCardProps extends BoxProps {
  node: ITreeMapObject;
}

const MAX_TOOLTIP_ITEMS = 80;

export const EmployeeSelectCard: FC<
  { children?: any } & EmployeeSelectCardProps
> = ({ node, ...boxProps }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const isOfficeCard =
    node.type === TreeTypeEnum.OFFICE || node.type === TreeTypeEnum.SUB_OFFICE;
  const isSubOffice = node.type === TreeTypeEnum.SUB_OFFICE;
  const count = node.employeesCount ?? 0;

  const hierarchyId = String(node.id).split('//')[0] || '';

  const query = useMemo(() => {
    const base: IQueryEmployee = {
      disabled: !tooltipOpen || !hierarchyId,
    };

    if (isSubOffice) {
      base.hierarchySubOfficeId = hierarchyId;
    } else {
      base.hierarchyId = hierarchyId;
    }

    return base;
  }, [hierarchyId, isSubOffice, tooltipOpen]);

  const {
    data: employees,
    count: fetchedCount,
    isLoading,
  } = useQueryEmployees(
    1,
    query,
    Math.min(Math.max(count, 20), MAX_TOOLTIP_ITEMS),
  );

  if (!isOfficeCard || count <= 0) return null;

  const remaining = Math.max(fetchedCount - employees.length, 0);

  const tooltipTitle = (
    <Box
      sx={{
        maxHeight: 220,
        overflowY: 'auto',
        minWidth: 160,
        maxWidth: 280,
        py: 0.5,
        pr: 0.5,
      }}
    >
      <SText
        fontSize={12}
        sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2, color: '#fff' }}
      >
        Funcionários vinculados
      </SText>
      {isLoading && (
        <SText fontSize={12} sx={{ color: '#fff' }}>
          Carregando...
        </SText>
      )}
      {!isLoading &&
        employees.map((employee) => (
          <SText
            key={employee.id}
            fontSize={12}
            sx={{ display: 'block', lineHeight: 1.35, py: 0.25, color: '#fff' }}
          >
            {employee.name}
          </SText>
        ))}
      {!isLoading && remaining > 0 && (
        <SText fontSize={11} sx={{ mt: 0.5, opacity: 0.85, color: '#fff' }}>
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
              maxWidth: 300,
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
