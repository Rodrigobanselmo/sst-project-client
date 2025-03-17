import { STextRowProps } from '../STextRow/STextRow.types';

export type STextCopyRowProps = Omit<STextRowProps, 'text'> & {
  text: string;
};
