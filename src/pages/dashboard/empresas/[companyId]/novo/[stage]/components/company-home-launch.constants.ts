/** Altura única dos cards da linha "Lançamentos" na home da empresa. */
export const COMPANY_HOME_LAUNCH_CARD_HEIGHT = 168;

export const companyHomeLaunchCardShellSx = {
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  height: COMPANY_HOME_LAUNCH_CARD_HEIGHT,
  minHeight: COMPANY_HOME_LAUNCH_CARD_HEIGHT,
  maxHeight: COMPANY_HOME_LAUNCH_CARD_HEIGHT,
} as const;
