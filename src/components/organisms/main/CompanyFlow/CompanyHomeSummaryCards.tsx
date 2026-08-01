import { Box } from '@mui/material';
import { ISActionButtonProps } from 'components/atoms/SActionButton/types';
import { SActionGroupButton } from 'components/atoms/SActionGroupButton';
import SText from 'components/atoms/SText';
import { CompanyActionEnum } from 'core/enums/company-action.enum';
import { IUseCompanyStep } from 'core/hooks/action-steps/useCompanyStep';
import { CompanyHomeActionPlanGroupCard } from 'pages/dashboard/empresas/[companyId]/novo/[stage]/components/CompanyHomeActionPlanGroupCard/CompanyHomeActionPlanGroupCard';
import { CompanyHomeFormsGroupCard } from 'pages/dashboard/empresas/[companyId]/novo/[stage]/components/CompanyHomeFormsGroupCard/CompanyHomeFormsGroupCard';
import {
  companyHomeLaunchCardShellConsolidatedSx,
  companyHomeLaunchCardShellSx,
  getConsolidatedFormsCardShellSx,
  getConsolidatedLaunchCardsGridSx,
} from 'pages/dashboard/empresas/[companyId]/novo/[stage]/components/company-home-launch.constants';

type SummarySource = Pick<
  IUseCompanyStep,
  | 'pageGroupMemo'
  | 'launchCardsMemo'
  | 'formsLaunchGroup'
  | 'showFormsLaunchGroup'
  | 'actionPlanLaunchGroup'
  | 'showActionPlanLaunchGroup'
  | 'stage'
  | 'company'
  | 'isGroupConsolidated'
>;

type Props = SummarySource & {
  /** Destaca o card Caracterização mesmo fora de /novo/sst. */
  forceCharacterizationActive?: boolean;
};

export function CompanyHomeSummaryCards({
  pageGroupMemo,
  launchCardsMemo,
  formsLaunchGroup,
  showFormsLaunchGroup,
  actionPlanLaunchGroup,
  showActionPlanLaunchGroup,
  stage,
  company,
  isGroupConsolidated,
  forceCharacterizationActive = false,
}: Props) {
  const topGridColumnCount = Math.max(1, pageGroupMemo.length);
  const launchGridColumnCount = Math.max(topGridColumnCount, 4);
  const homeCardsGridSx = {
    display: 'grid',
    gridTemplateColumns: `repeat(${topGridColumnCount}, minmax(0, 1fr))`,
    gap: 10,
    width: '100%',
    alignItems: 'stretch',
  };
  const launchCardsGridSx = {
    display: 'grid',
    gridTemplateColumns: `repeat(${launchGridColumnCount}, minmax(0, 1fr))`,
    gap: 10,
    width: '100%',
    alignItems: 'stretch',
  };
  const consolidatedLaunchHeightOptions = {
    formsCount: formsLaunchGroup.applications.length,
    actionPlanCompaniesCount: actionPlanLaunchGroup?.companies.length ?? 0,
  };
  const launchCardShellSx = isGroupConsolidated
    ? companyHomeLaunchCardShellConsolidatedSx
    : companyHomeLaunchCardShellSx;
  const launchCardsGridSxResolved = isGroupConsolidated
    ? getConsolidatedLaunchCardsGridSx(
        launchCardsGridSx,
        consolidatedLaunchHeightOptions,
      )
    : launchCardsGridSx;
  const formsCardShellSx = isGroupConsolidated
    ? getConsolidatedFormsCardShellSx(consolidatedLaunchHeightOptions)
    : launchCardShellSx;

  const hasLaunchRow =
    launchCardsMemo.length > 0 ||
    showFormsLaunchGroup ||
    showActionPlanLaunchGroup;

  return (
    <>
      <Box sx={{ ...homeCardsGridSx, mt: 2, mb: hasLaunchRow ? 30 : 16 }}>
        {pageGroupMemo.map(({ color, ...cardProps }) => {
          const isActive =
            (forceCharacterizationActive &&
              cardProps.type === CompanyActionEnum.SST_GROUP_PAGE) ||
            stage == cardProps.type;
          return (
            <Box
              key={cardProps.text}
              sx={{
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <SActionGroupButton
                active={isActive}
                color={color as string}
                {...cardProps}
                fillGridCell
                fillGridCellCompact
              />
            </Box>
          );
        })}
      </Box>

      {hasLaunchRow && (
        <>
          <SText mt={-8}>Lançamentos</SText>
          <Box sx={{ ...launchCardsGridSxResolved, mt: 3, mb: 16 }}>
            {showActionPlanLaunchGroup && actionPlanLaunchGroup && (
              <Box sx={launchCardShellSx}>
                <CompanyHomeActionPlanGroupCard
                  total={actionPlanLaunchGroup.total}
                  pending={actionPlanLaunchGroup.pending}
                  started={actionPlanLaunchGroup.started}
                  done={actionPlanLaunchGroup.done}
                  canceled={actionPlanLaunchGroup.canceled}
                  completionPercent={actionPlanLaunchGroup.completionPercent}
                  companies={actionPlanLaunchGroup.companies}
                  loading={actionPlanLaunchGroup.loading}
                  onClick={actionPlanLaunchGroup.onClick}
                />
              </Box>
            )}
            {launchCardsMemo.map((raw, index) => {
              const cardProps = raw as ISActionButtonProps;
              return (
                <Box key={`${cardProps.text}-${index}`} sx={launchCardShellSx}>
                  <SActionGroupButton
                    text={cardProps.text}
                    icon={cardProps.icon}
                    onClick={cardProps.onClick}
                    tooltipText={cardProps.tooltipText}
                    infos={cardProps.infos}
                    disabled={cardProps.disabled}
                    loading={cardProps.loading}
                    statusLabel={cardProps.statusLabel}
                    participationPercent={cardProps.participationPercent}
                    fillGridCell
                    fillGridCellLaunch
                  />
                </Box>
              );
            })}
            {showFormsLaunchGroup && (
              <Box
                sx={{
                  ...(formsCardShellSx as object),
                  gridColumn: {
                    xs: '1 / -1',
                    sm: launchGridColumnCount >= 4 ? 'span 2' : 'span 1',
                  },
                }}
              >
                <CompanyHomeFormsGroupCard
                  companyId={company.id}
                  applications={formsLaunchGroup.applications}
                  isEmpty={formsLaunchGroup.isEmpty}
                  emptyMessage={formsLaunchGroup.emptyMessage}
                  onViewAll={formsLaunchGroup.onViewAll}
                  isGroupConsolidated={formsLaunchGroup.isGroupConsolidated}
                  consolidatedViewHref={formsLaunchGroup.consolidatedViewHref}
                  consolidatedViewLabel={formsLaunchGroup.consolidatedViewLabel}
                />
              </Box>
            )}
          </Box>
        </>
      )}
    </>
  );
}
