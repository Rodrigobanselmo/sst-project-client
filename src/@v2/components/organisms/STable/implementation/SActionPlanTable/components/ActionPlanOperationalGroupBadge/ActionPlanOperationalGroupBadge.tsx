import { Box } from '@mui/material';

import STooltip from '@v2/components/atoms/STooltip/STooltip';
import { ActionPlanOperationalScopeEnum } from '@v2/models/security/enums/action-plan-operational-grouping-filter.enum';

const SCOPE_LABEL: Record<ActionPlanOperationalScopeEnum, string> = {
  [ActionPlanOperationalScopeEnum.GLOBAL]: 'Equivalência GLOBAL',
  [ActionPlanOperationalScopeEnum.COMPANY]: 'Equivalência COMPANY',
};

const GROUPED_SX = {
  borderColor: 'info.main',
  color: 'info.dark',
  bgcolor: 'rgba(2, 136, 209, 0.08)',
};

const UNGROUPED_SX = {
  borderColor: 'grey.400',
  color: 'text.secondary',
  bgcolor: 'grey.100',
};

export function ActionPlanOperationalGroupBadge({
  applicationsCount,
  scope,
}: {
  applicationsCount: number;
  scope?: ActionPlanOperationalScopeEnum | null;
}) {
  const grouped = applicationsCount > 1;
  const scopeLabel = scope ? SCOPE_LABEL[scope] : null;
  const title = grouped
    ? `Na visão Ações, esta ação possui ${applicationsCount} aplicações/origens.${
        scopeLabel ? `\n${scopeLabel}` : ''
      }`
    : `Na visão Ações, esta ação possui uma única aplicação/origem.${
        scopeLabel ? `\n${scopeLabel}` : ''
      }`;

  return (
    <STooltip
      minLength={0}
      placement="top"
      title={
        <Box component="span" sx={{ whiteSpace: 'pre-line' }}>
          {title}
        </Box>
      }
    >
      <Box
        component="span"
        aria-label={title}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 20,
          minWidth: 36,
          px: 1,
          borderRadius: '4px',
          border: '1px solid',
          fontSize: 10,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: 0.2,
          flexShrink: 0,
          userSelect: 'none',
          ...(grouped ? GROUPED_SX : UNGROUPED_SX),
        }}
      >
        {grouped ? 'Sim' : 'Não'}
      </Box>
    </STooltip>
  );
}
