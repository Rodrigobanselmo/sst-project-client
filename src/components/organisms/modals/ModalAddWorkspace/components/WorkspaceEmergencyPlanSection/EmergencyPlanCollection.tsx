import { ReactNode } from 'react';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Box } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';

type EmergencyPlanCollectionProps = {
  title: string;
  description?: string;
  addLabel: string;
  emptyLabel: string;
  count: number;
  onAdd: () => void;
  children: ReactNode;
};

export const EmergencyPlanCollection = ({
  title,
  description,
  addLabel,
  emptyLabel,
  count,
  onAdd,
  children,
}: EmergencyPlanCollectionProps) => {
  return (
    <Box
      sx={{
        p: 5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <SFlex align="center" justify="space-between" gap={4} flexWrap="wrap">
        <Box>
          <SText fontSize={16} fontWeight={600}>
            {title}
          </SText>
          {description ? (
            <SText color="text.secondary" fontSize={13} mt={1}>
              {description}
            </SText>
          ) : null}
        </Box>
        <SButton type="button" variant="outlined" xsmall onClick={onAdd}>
          {addLabel}
        </SButton>
      </SFlex>

      {count === 0 ? (
        <SText color="text.secondary" fontSize={13} mt={5}>
          {emptyLabel}
        </SText>
      ) : (
        <SFlex direction="column" gap={4} mt={5}>
          {children}
        </SFlex>
      )}
    </Box>
  );
};

type EmergencyPlanItemFrameProps = {
  title: string;
  badge?: ReactNode;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  children: ReactNode;
};

export const EmergencyPlanItemFrame = ({
  title,
  badge,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
  children,
}: EmergencyPlanItemFrameProps) => {
  return (
    <Box
      sx={{
        p: 4,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
      }}
    >
      <SFlex align="center" justify="space-between" gap={3} mb={4}>
        <SFlex align="center" gap={3} flexWrap="wrap">
          <SText fontSize={13} color="text.secondary">
            {index + 1}.
          </SText>
          <SText fontSize={14} fontWeight={600}>
            {title}
          </SText>
          {badge}
        </SFlex>
        <SFlex align="center" gap={1}>
          <SIconButton
            type="button"
            size="small"
            tooltip="Subir"
            disabled={index === 0}
            onClick={onMoveUp}
          >
            <ArrowUpwardIcon sx={{ fontSize: 18 }} />
          </SIconButton>
          <SIconButton
            type="button"
            size="small"
            tooltip="Descer"
            disabled={index === total - 1}
            onClick={onMoveDown}
          >
            <ArrowDownwardIcon sx={{ fontSize: 18 }} />
          </SIconButton>
          <SIconButton
            type="button"
            size="small"
            tooltip="Remover"
            onClick={onRemove}
          >
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </SIconButton>
        </SFlex>
      </SFlex>
      {children}
    </Box>
  );
};
