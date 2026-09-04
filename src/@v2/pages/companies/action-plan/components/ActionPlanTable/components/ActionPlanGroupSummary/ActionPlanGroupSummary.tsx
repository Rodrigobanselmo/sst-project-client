import { Box, Typography } from '@mui/material';

import { SText } from '@v2/components/atoms/SText/SText';
import { ActionPlanBrowseGroupModel } from '@v2/models/security/models/action-plan/action-plan-browse-group.model';
import { ActionPlanStatusTypeTranslate } from '@v2/models/security/translations/action-plan-status-type.translaton';
import { dateUtils } from '@v2/utils/date-utils';

const MULTIPLE_LABEL = 'Múltiplos';

export function ActionPlanGroupSummaryText({
  group,
  field,
}: {
  group: ActionPlanBrowseGroupModel;
  field: 'status' | 'responsible' | 'validDate';
}) {
  if (field === 'status') {
    if (group.statusMultiple) {
      return <SText fontSize={12}>{MULTIPLE_LABEL}</SText>;
    }

    return (
      <SText fontSize={12}>
        {group.status ? ActionPlanStatusTypeTranslate[group.status] : '—'}
      </SText>
    );
  }

  if (field === 'responsible') {
    if (group.responsibleMultiple) {
      return <SText fontSize={12}>{MULTIPLE_LABEL}</SText>;
    }

    return (
      <SText fontSize={12} lineNumber={1}>
        {group.responsible?.name || '—'}
      </SText>
    );
  }

  if (group.validDateMultiple) {
    return <SText fontSize={12}>{MULTIPLE_LABEL}</SText>;
  }

  return (
    <SText fontSize={12} textAlign="center">
      {group.validDate ? dateUtils(group.validDate).format('DD/MM/YYYY') : 'SEM PRAZO'}
    </SText>
  );
}

export function ActionPlanGroupApplicationsLabel({
  count,
}: {
  count: number;
}) {
  return (
    <Box>
      <SText fontSize={13} fontWeight={600}>
        {count} {count === 1 ? 'origem' : 'origens'}
      </SText>
      <Typography variant="caption" color="text.secondary">
        aplicações
      </Typography>
    </Box>
  );
}
