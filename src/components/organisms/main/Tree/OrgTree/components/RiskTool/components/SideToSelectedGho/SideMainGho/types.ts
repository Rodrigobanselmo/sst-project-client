import { IGho } from 'core/interfaces/api/IGho';

export interface SideItemsProps {
  isSelected?: boolean;
  isEndSelect?: boolean;
  data: IGho;
  handleSelect: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  handleEndSelect?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
}
