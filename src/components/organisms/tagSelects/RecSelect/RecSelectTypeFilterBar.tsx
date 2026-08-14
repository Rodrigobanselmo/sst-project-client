import React, { FC } from 'react';

import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import { Box, Icon } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';
import { RecTypeEnum } from 'project/enum/recType.enum';

import { REC_TYPE_COLOR, REC_TYPE_ICON } from './RecSelectRecTypeAdornment';
import {
  REC_TYPE_LIST_FILTERS,
  REC_TYPE_VISUAL_LABEL,
  RecTypeListFilter,
} from './resolve-rec-type-visual-state.util';

function stopFilterBarEvent(event: {
  stopPropagation: () => void;
}): void {
  event.stopPropagation();
}

type RecSelectTypeFilterBarProps = {
  value: RecTypeListFilter;
  onChange: (filter: RecTypeListFilter) => void;
};

const FILTER_TOOLTIP: Record<RecTypeListFilter, string> = {
  all: 'Todos',
  [RecTypeEnum.ADM]: REC_TYPE_VISUAL_LABEL[RecTypeEnum.ADM],
  [RecTypeEnum.ENG]: REC_TYPE_VISUAL_LABEL[RecTypeEnum.ENG],
  [RecTypeEnum.EPI]: REC_TYPE_VISUAL_LABEL[RecTypeEnum.EPI],
};

export const RecSelectTypeFilterBar: FC<RecSelectTypeFilterBarProps> = ({
  value,
  onChange,
}) => {
  return (
    <Box
      onClick={stopFilterBarEvent}
      onMouseDown={stopFilterBarEvent}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        pt: 0.5,
      }}
    >
      {REC_TYPE_LIST_FILTERS.map((filter) => {
        const selected = value === filter;
        const icon =
          filter === 'all' ? AppsOutlinedIcon : REC_TYPE_ICON[filter];
        const color =
          filter === 'all'
            ? selected
              ? 'text.primary'
              : 'text.light'
            : REC_TYPE_COLOR[filter];

        return (
          <STooltip key={filter} withWrapper title={FILTER_TOOLTIP[filter]}>
            <SIconButton
              aria-label={`Filtrar recomendações: ${FILTER_TOOLTIP[filter]}`}
              aria-pressed={selected}
              onClick={(event) => {
                stopFilterBarEvent(event);
                onChange(filter);
              }}
              onMouseDown={stopFilterBarEvent}
              sx={{
                width: 28,
                height: 28,
                border: '1px solid',
                borderColor: selected ? color : 'transparent',
                bgcolor: selected ? 'action.selected' : 'transparent',
              }}
            >
              <Icon component={icon} sx={{ fontSize: 16, color }} />
            </SIconButton>
          </STooltip>
        );
      })}
    </Box>
  );
};
