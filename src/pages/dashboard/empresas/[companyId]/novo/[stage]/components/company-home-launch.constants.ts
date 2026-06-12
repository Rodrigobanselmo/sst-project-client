import { SxProps, Theme } from '@mui/material';

/** Altura única dos cards da linha "Lançamentos" na home da empresa. */
export const COMPANY_HOME_LAUNCH_CARD_HEIGHT = 168;

const FORM_ITEM_HEIGHT_WITH_COMPANY_LABEL = 58;
const ACTION_PLAN_ITEM_HEIGHT_WITH_COMPANY_LABEL = 44;
const FORMS_CARD_CHROME_HEIGHT = 100;
const ACTION_PLAN_CARD_CHROME_HEIGHT = 148;
const CONSOLIDATED_LAUNCH_ROW_MAX_HEIGHT = {
  xs: 320,
  sm: 520,
} as const;

export const companyHomeLaunchCardShellSx = {
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  height: COMPANY_HOME_LAUNCH_CARD_HEIGHT,
  minHeight: COMPANY_HOME_LAUNCH_CARD_HEIGHT,
  maxHeight: COMPANY_HOME_LAUNCH_CARD_HEIGHT,
} as const;

export const companyHomeLaunchCardShellConsolidatedSx = {
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: COMPANY_HOME_LAUNCH_CARD_HEIGHT,
} as const;

function getConsolidatedCardContentHeight(
  chromeHeight: number,
  itemHeight: number,
  itemCount: number,
): number {
  if (itemCount <= 0) {
    return COMPANY_HOME_LAUNCH_CARD_HEIGHT;
  }

  return Math.max(
    COMPANY_HOME_LAUNCH_CARD_HEIGHT,
    chromeHeight + itemCount * itemHeight,
  );
}

export function getConsolidatedLaunchRowMinHeight(options: {
  formsCount?: number;
  actionPlanCompaniesCount?: number;
}): number {
  const formsHeight = getConsolidatedCardContentHeight(
    FORMS_CARD_CHROME_HEIGHT,
    FORM_ITEM_HEIGHT_WITH_COMPANY_LABEL,
    options.formsCount ?? 0,
  );
  const actionPlanHeight = getConsolidatedCardContentHeight(
    ACTION_PLAN_CARD_CHROME_HEIGHT,
    ACTION_PLAN_ITEM_HEIGHT_WITH_COMPANY_LABEL,
    options.actionPlanCompaniesCount ?? 0,
  );

  return Math.max(
    COMPANY_HOME_LAUNCH_CARD_HEIGHT,
    formsHeight,
    actionPlanHeight,
  );
}

function clampConsolidatedLaunchRowHeight(
  height: number,
  breakpoint: keyof typeof CONSOLIDATED_LAUNCH_ROW_MAX_HEIGHT,
): number {
  return Math.min(height, CONSOLIDATED_LAUNCH_ROW_MAX_HEIGHT[breakpoint]);
}

export function getConsolidatedLaunchCardsGridSx(
  baseGridSx: SxProps<Theme>,
  options: {
    formsCount?: number;
    actionPlanCompaniesCount?: number;
  },
): SxProps<Theme> {
  const targetMinHeight = getConsolidatedLaunchRowMinHeight(options);

  return {
    ...(baseGridSx as object),
    minHeight: {
      xs: COMPANY_HOME_LAUNCH_CARD_HEIGHT,
      sm: clampConsolidatedLaunchRowHeight(targetMinHeight, 'sm'),
    },
  };
}

export function getConsolidatedFormsCardShellSx(
  options: {
    formsCount?: number;
    actionPlanCompaniesCount?: number;
  },
): SxProps<Theme> {
  const targetMinHeight = getConsolidatedLaunchRowMinHeight(options);

  return {
    ...companyHomeLaunchCardShellConsolidatedSx,
    minHeight: {
      xs: clampConsolidatedLaunchRowHeight(targetMinHeight, 'xs'),
      sm: COMPANY_HOME_LAUNCH_CARD_HEIGHT,
    },
  };
}
