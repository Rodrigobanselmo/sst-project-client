import { STextRowProps } from '../STextRow/STextRow.types';

export type STextClickRowProps = STextRowProps & {
  onClick: () => void;
};
