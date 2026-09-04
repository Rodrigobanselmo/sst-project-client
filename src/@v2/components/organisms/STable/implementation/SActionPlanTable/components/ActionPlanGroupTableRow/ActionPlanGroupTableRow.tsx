import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Box, IconButton } from '@mui/material';

import { SRiskChip } from '@v2/components/molecules/SRiskChip/SRiskChip';
import { STextRow } from '@v2/components/organisms/STable/addons/addons-rows/STextRow/STextRow';
import { ActionPlanRecommendationTypeBadge } from '@v2/components/organisms/STable/implementation/SActionPlanTable/components/ActionPlanRecommendationTypeBadge/ActionPlanRecommendationTypeBadge';
import { ActionPlanColumnsEnum } from '@v2/components/organisms/STable/implementation/SActionPlanTable/enums/action-plan-columns.enum';
import { getHiddenColumn } from '@v2/components/organisms/STable/implementation/SActionPlanTable/helpers/get-hidden-column';
import { STableRow } from '@v2/components/organisms/STable/common/STableRow/STableRow';
import { ActionPlanBrowseGroupModel } from '@v2/models/security/models/action-plan/action-plan-browse-group.model';
import {
  ActionPlanGroupApplicationsLabel,
  ActionPlanGroupSummaryText,
} from '@v2/pages/companies/action-plan/components/ActionPlanTable/components/ActionPlanGroupSummary/ActionPlanGroupSummary';

const COLUMN_ORDER = [
  ActionPlanColumnsEnum.CHECK_BOX,
  ActionPlanColumnsEnum.ID,
  ActionPlanColumnsEnum.ORIGIN,
  ActionPlanColumnsEnum.RISK,
  ActionPlanColumnsEnum.GENERATE_SOURCE,
  ActionPlanColumnsEnum.LEVEL,
  ActionPlanColumnsEnum.EXPOSED_WORKERS,
  ActionPlanColumnsEnum.RECOMMENDATION,
  ActionPlanColumnsEnum.STATUS,
  ActionPlanColumnsEnum.EFFECTIVENESS,
  ActionPlanColumnsEnum.RESPONSIBLE,
  ActionPlanColumnsEnum.CREATED_AT,
  ActionPlanColumnsEnum.UPDATED_AT,
  ActionPlanColumnsEnum.VALID_DATE,
  ActionPlanColumnsEnum.COMMENT,
] as const;

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
      return (
        <STextRow
          key={column}
          text={group.risk.name}
          tooltipMinLength={20}
          bottomText={
            group.risk.severity != null
              ? `Severidade ${group.risk.severity}`
              : undefined
          }
          startAddon={
            <SRiskChip type={group.risk.type} subTypes={group.risk.subTypes} />
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
          text={group.recommendation.name}
          startAddon={
            <ActionPlanRecommendationTypeBadge
              type={group.recommendation.type}
              variant="dot"
            />
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
