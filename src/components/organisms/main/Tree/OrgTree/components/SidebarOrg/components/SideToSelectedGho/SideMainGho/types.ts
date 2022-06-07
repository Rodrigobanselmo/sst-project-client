import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';

export interface SideItemsProps {
  isSelected?: boolean;
  data: IGho;
  handleSelect: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}
