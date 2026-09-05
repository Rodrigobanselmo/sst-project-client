import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Box, IconButton } from '@mui/material';

import STooltip from '@v2/components/atoms/STooltip/STooltip';
import { SRiskChip } from '@v2/components/molecules/SRiskChip/SRiskChip';
import { STextRow } from '@v2/components/organisms/STable/addons/addons-rows/STextRow/STextRow';
import { ActionPlanRecommendationTypeBadge } from '@v2/components/organisms/STable/implementation/SActionPlanTable/components/ActionPlanRecommendationTypeBadge/ActionPlanRecommendationTypeBadge';
import { ActionPlanColumnsEnum } from '@v2/components/organisms/STable/implementation/SActionPlanTable/enums/action-plan-columns.enum';
import { getHiddenColumn } from '@v2/components/organisms/STable/implementation/SActionPlanTable/helpers/get-hidden-column';
import { ACTION_PLAN_GROUPED_COLUMN_ORDER } from '@v2/components/organisms/STable/implementation/SActionPlanTable/maps/action-plan-column-order';
import {
  formatActionPlanGroupRiskCount,
  uniqueActionPlanGroupRisks,
} from '@v2/components/organisms/STable/implementation/SActionPlanTable/helpers/unique-action-plan-group-risks';
import { STableRow } from '@v2/components/organisms/STable/common/STableRow/STableRow';
import { ActionPlanBrowseGroupModel } from '@v2/models/security/models/action-plan/action-plan-browse-group.model';
import {
  ActionPlanGroupApplicationsLabel,
  ActionPlanGroupSummaryText,
} from '@v2/pages/companies/action-plan/components/ActionPlanTable/components/ActionPlanGroupSummary/ActionPlanGroupSummary';

const COLUMN_ORDER = ACTION_PLAN_GROUPED_COLUMN_ORDER;

export function ActionPlanGroupTableRow({
  group,
  expanded,
  onToggle,
  hiddenColumns,
}: {
  group: ActionPlanBrowseGroupModel;
  expanded: boolean;
  onToggle: () => void;
  hiddenColumns: Record<ActionPlanColumnsEnum, boolean>;
}) {
  const cells = COLUMN_ORDER.filter(
    (column) => !getHiddenColumn(hiddenColumns, column),
  ).map((column) => {
    if (column === ActionPlanColumnsEnum.CHECK_BOX) {
      return (
        <Box key={column} onClick={(event) => event.stopPropagation()}>
          <IconButton
            size="small"
            aria-label={expanded ? 'Recolher origens' : 'Expandir origens'}
            onClick={onToggle}
          >
            {expanded ? (
              <KeyboardArrowDownIcon fontSize="small" />
            ) : (
              <KeyboardArrowRightIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
      );
    }

    if (column === ActionPlanColumnsEnum.ORIGIN) {
      return (
        <ActionPlanGroupApplicationsLabel
          key={column}
          count={group.applicationsCount}
        />
      );
    }

    if (column === ActionPlanColumnsEnum.RISK) {
      if (group.risksCount > 1) {
        const distinctRisks = uniqueActionPlanGroupRisks(group.risks);
        return (
          <STooltip
            key={column}
            minLength={0}
            placement="right"
            withWrapper
            title={
              <Box component="ul" sx={{ m: 0, pl: 2, py: 0.5, maxWidth: 420 }}>
                {distinctRisks.map((risk) => (
                  <Box component="li" key={risk.id} sx={{ mb: 0.5 }}>
                    {risk.name}
                  </Box>
                ))}
              </Box>
            }
          >
            <STextRow
              text={formatActionPlanGroupRiskCount(distinctRisks.length)}
              tooltipTitle=""
              tooltipMinLength={Number.MAX_SAFE_INTEGER}
            />
          </STooltip>
        );
      }

      const singleRisk = group.risks[0];
      return (
        <STextRow
          key={column}
          text={singleRisk?.name || '—'}
          tooltipMinLength={20}
          bottomText={
            singleRisk?.severity != null
              ? `Severidade ${singleRisk.severity}`
              : undefined
          }
          startAddon={
            singleRisk ? (
              <SRiskChip type={singleRisk.type} subTypes={singleRisk.subTypes} />
            ) : undefined
          }
        />
      );
    }

    if (column === ActionPlanColumnsEnum.RECOMMENDATION) {
      return (
        <STextRow
          key={column}
          fontSize={13}
          tooltipMinLength={30}
          lineNumber={2}
          text={group.recommendation.name || 'Múltiplas recomendações'}
          startAddon={
            group.recommendation.type && !group.recommendation.multiple ? (
              <ActionPlanRecommendationTypeBadge
                type={group.recommendation.type}
                variant="dot"
              />
            ) : undefined
          }
        />
      );
    }

    if (column === ActionPlanColumnsEnum.STATUS) {
      return (
        <ActionPlanGroupSummaryText
          key={column}
          group={group}
          field="status"
        />
      );
    }

    if (column === ActionPlanColumnsEnum.RESPONSIBLE) {
      return (
        <ActionPlanGroupSummaryText
          key={column}
          group={group}
          field="responsible"
        />
      );
    }

    if (column === ActionPlanColumnsEnum.VALID_DATE) {
      return (
        <ActionPlanGroupSummaryText
          key={column}
          group={group}
          field="validDate"
        />
      );
    }

    return <Box key={column} />;
  });

  return (
    <STableRow clickable onClick={onToggle} minHeight={35}>
      {cells}
    </STableRow>
  );
}
