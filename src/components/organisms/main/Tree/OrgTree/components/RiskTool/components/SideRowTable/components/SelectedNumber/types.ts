export interface SelectedNumberProps {
  handleHelp?: () => void;
  handleSelect?: (number: number) => void;
  selectedNumber?: number;
  disabledGtEqual?: number;
  disabledReason?: string;
  getDisabledReason?: (number: number) => string | undefined;
  disabledNumbers?: number[];
}
