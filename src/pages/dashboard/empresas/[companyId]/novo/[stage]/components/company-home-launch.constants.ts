import { SxProps, Theme } from '@mui/material';

/** Altura única dos cards da linha "Lançamentos" na home da empresa. */
export const COMPANY_HOME_LAUNCH_CARD_HEIGHT = 168;

const FORM_ITEM_HEIGHT_WITH_COMPANY_LABEL = 58;
const FORMS_CARD_CHROME_HEIGHT = 100;
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

export function getConsolidatedLaunchRowMinHeight(formsCount: number): number {
  if (formsCount <= 0) {
    return COMPANY_HOME_LAUNCH_CARD_HEIGHT;
  }

  const contentHeight =
    FORMS_CARD_CHROME_HEIGHT + formsCount * FORM_ITEM_HEIGHT_WITH_COMPANY_LABEL;

  return Math.max(COMPANY_HOME_LAUNCH_CARD_HEIGHT, contentHeight);
}

function clampConsolidatedLaunchRowHeight(
  height: number,
  breakpoint: keyof typeof CONSOLIDATED_LAUNCH_ROW_MAX_HEIGHT,
): number {
  return Math.min(height, CONSOLIDATED_LAUNCH_ROW_MAX_HEIGHT[breakpoint]);
}

export function getConsolidatedLaunchCardsGridSx(
  baseGridSx: SxProps<Theme>,
  formsCount: number,
): SxProps<Theme> {
  const targetMinHeight = getConsolidatedLaunchRowMinHeight(formsCount);

  return {
    ...(baseGridSx as object),
    minHeight: {
      xs: COMPANY_HOME_LAUNCH_CARD_HEIGHT,
      sm: clampConsolidatedLaunchRowHeight(targetMinHeight, 'sm'),
    },
  };
}

export function getConsolidatedFormsCardShellSx(
  formsCount: number,
): SxProps<Theme> {
  const targetMinHeight = getConsolidatedLaunchRowMinHeight(formsCount);

  return {
    ...companyHomeLaunchCardShellConsolidatedSx,
    minHeight: {
      xs: clampConsolidatedLaunchRowHeight(targetMinHeight, 'xs'),
      sm: COMPANY_HOME_LAUNCH_CARD_HEIGHT,
    },
  };
}
