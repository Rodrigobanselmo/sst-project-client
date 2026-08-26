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

type RecTypeCategoryIconProps = {
  recType?: RecTypeEnum | string | null;
  fontSize?: number;
};

/** Ícone ADM/ENG/EPI do seletor; não renderiza se o tipo estiver ausente. */
export const RecTypeCategoryIcon: FC<RecTypeCategoryIconProps> = ({
  recType,
  fontSize = 15,
}) => {
  const visual = resolveRecTypeVisualState(recType);
  if (visual.kind !== 'classified') return null;
  return (
    <Icon
      component={REC_TYPE_ICON[visual.recType]}
      sx={{ fontSize, color: REC_TYPE_COLOR[visual.recType] }}
    />
  );
};

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
      <RecTypeCategoryIcon recType={visual.recType} />
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
