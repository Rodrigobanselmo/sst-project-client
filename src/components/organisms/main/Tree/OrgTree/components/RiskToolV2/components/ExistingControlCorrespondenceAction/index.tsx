import React, { FC } from 'react';

import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import { Box, Icon, Typography } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';
import { isNaRecMed } from 'project/utils/isNa';

import { IRecMed } from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';

import {
  EXISTING_CONTROL_CORRESPONDENCE_LABEL,
  EXISTING_CONTROL_LINK_CREATE_TOOLTIP,
  EXISTING_CONTROL_LINK_UNDO_TOOLTIP,
  INCORPORATED_IN_OPEN_WORKSPACE_LABEL,
  resolveControlCorrespondencePresentation,
} from '../../utils/existing-control-correspondence.util';

export const ExistingControlLinkedOptionCaption: FC<{ active: boolean }> = ({
  active,
}) => {
  if (!active) return null;

  return (
    <Typography
      component="span"
      sx={{
        mr: 1,
        maxWidth: 160,
        fontSize: 10,
        lineHeight: 1.15,
        color: 'text.secondary',
        textAlign: 'right',
        whiteSpace: 'normal',
      }}
    >
      {EXISTING_CONTROL_CORRESPONDENCE_LABEL}
    </Typography>
  );
};

export const ExistingControlCorrespondenceAction: FC<{
  linked: boolean;
  incorporated?: boolean;
  onLink?: () => void;
  onUndo?: () => void;
}> = ({ linked, incorporated, onLink, onUndo }) => {
  if (incorporated) {
    return (
      <STooltip
        title={INCORPORATED_IN_OPEN_WORKSPACE_LABEL}
        componentsProps={{
          tooltip: { sx: { maxWidth: 280, whiteSpace: 'pre-line' } },
        }}
      >
        <Box
          component="span"
          sx={{ display: 'inline-flex', lineHeight: 0 }}
          onMouseDown={(event) => event.stopPropagation()}
          onMouseOver={(event) => event.stopPropagation()}
        >
          <Icon
            component={LinkOutlinedIcon}
            sx={{ fontSize: 14, color: 'text.secondary' }}
          />
        </Box>
      </STooltip>
    );
  }

  if (!linked && !onLink) return null;

  const tooltip = linked
    ? EXISTING_CONTROL_LINK_UNDO_TOOLTIP
    : EXISTING_CONTROL_LINK_CREATE_TOOLTIP;

  return (
    <STooltip
      title={tooltip}
      componentsProps={{
        tooltip: { sx: { maxWidth: 280, whiteSpace: 'pre-line' } },
      }}
    >
      <Box
        component="span"
        sx={{ display: 'inline-flex', lineHeight: 0 }}
        onMouseDown={(event) => event.stopPropagation()}
        onMouseOver={(event) => event.stopPropagation()}
      >
        <SIconButton
          sx={{ maxWidth: 10, maxHeight: 10, p: 0 }}
          onClick={(event) => {
            event.stopPropagation();
            if (linked) {
              onUndo?.();
              return;
            }
            onLink?.();
          }}
        >
          <Icon
            component={LinkOutlinedIcon}
            sx={{
              fontSize: 14,
              color: linked ? 'text.secondary' : 'schema.red',
            }}
          />
        </SIconButton>
      </Box>
    </STooltip>
  );
};

export const ControlCorrespondenceRowAction: FC<{
  kind: 'adm' | 'eng';
  control: Pick<IRecMed, 'id' | 'medName' | 'recName'>;
  recs?: Array<IRecMed | null | undefined> | null;
  dataRecs?: Parameters<
    typeof resolveControlCorrespondencePresentation
  >[0]['dataRecs'];
  derivedMeasures?: Parameters<
    typeof resolveControlCorrespondencePresentation
  >[0]['derivedMeasures'];
  workspaceId?: string | null;
  companyId?: string | null;
  onLink: (payload: Partial<IUpsertRiskData>) => void;
  onUndo: (payload: Partial<IUpsertRiskData>) => void;
}> = ({
  kind,
  control,
  recs,
  dataRecs,
  derivedMeasures,
  workspaceId,
  companyId,
  onLink,
  onUndo,
}) => {
  const controlName = control.medName || control.recName || '';
  if (isNaRecMed(controlName)) return null;

  const presentation = resolveControlCorrespondencePresentation({
    kind,
    controlId: control.id,
    controlName,
    companyId,
    recs,
    dataRecs,
    derivedMeasures,
    workspaceId,
  });

  const link = presentation.link;
  const undo = presentation.undo;

  return (
    <ExistingControlCorrespondenceAction
      linked={presentation.linked}
      incorporated={presentation.incorporated}
      onLink={link ? () => onLink(link) : undefined}
      onUndo={undo ? () => onUndo(undo) : undefined}
    />
  );
};
