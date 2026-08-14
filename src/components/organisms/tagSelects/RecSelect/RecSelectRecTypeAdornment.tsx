import React, { FC } from 'react';

import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PrecisionManufacturingOutlinedIcon from '@mui/icons-material/PrecisionManufacturingOutlined';
import { Box, Icon } from '@mui/material';
import { MissingRecTypeClassifyPopover } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/components/MissingRecTypeClassifyPopover';
import { RecTypeEnum } from 'project/enum/recType.enum';

import { SEpiIcon } from 'assets/icons/SEpiIcon';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';

import {
  resolveRecTypeVisualState,
  stopRecSelectAdornmentEvent,
} from './resolve-rec-type-visual-state.util';

export const REC_TYPE_ICON = {
  [RecTypeEnum.ADM]: AssignmentOutlinedIcon,
  [RecTypeEnum.ENG]: PrecisionManufacturingOutlinedIcon,
  [RecTypeEnum.EPI]: SEpiIcon,
} as const;

export const REC_TYPE_COLOR = {
  [RecTypeEnum.ADM]: 'info.main',
  [RecTypeEnum.ENG]: 'success.main',
  [RecTypeEnum.EPI]: 'text.secondary',
} as const;

type RecSelectRecTypeAdornmentProps = {
  rec: IRecMed;
  loading?: boolean;
  onClassify: (recType: RecTypeEnum) => void | Promise<void>;
};

export const RecSelectRecTypeAdornment: FC<RecSelectRecTypeAdornmentProps> = ({
  rec,
  loading,
  onClassify,
}) => {
  const visual = resolveRecTypeVisualState(rec.recType);
  const trigger =
    visual.kind === 'classified' ? (
      <Icon
        component={REC_TYPE_ICON[visual.recType]}
        sx={{ fontSize: 15, color: REC_TYPE_COLOR[visual.recType] }}
      />
    ) : undefined;

  return (
    <Box
      onClick={stopRecSelectAdornmentEvent}
      onMouseDown={stopRecSelectAdornmentEvent}
      sx={{ display: 'inline-flex', mr: '6px', flexShrink: 0 }}
    >
      <MissingRecTypeClassifyPopover
        onClassify={onClassify}
        loading={loading}
        tooltipFallback={visual.tooltip}
        trigger={trigger}
      />
    </Box>
  );
};
