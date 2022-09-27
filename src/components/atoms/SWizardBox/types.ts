import { BoxProps, Theme } from '@mui/material';

type IDirection = 'row' | 'column';
type ResponsiveStyleValue<T> =
  | T
  | Array<T | null>
  | { [key: string]: T | null };

type SelfPosition =
  | 'center'
  | 'end'
  | 'flex-end'
  | 'flex-start'
  | 'self-end'
  | 'self-start'
  | 'start';

type AlignItems = SelfPosition | 'baseline' | 'normal' | 'stretch' | string;

export interface SFlexProps extends BoxProps {
  direction?: IDirection | IDirection[];
  center?: boolean;
  align?:
    | ResponsiveStyleValue<AlignItems | AlignItems[] | undefined>
    | ((
        theme: Theme,
      ) => ResponsiveStyleValue<AlignItems | AlignItems[] | undefined>);
  justify?:
    | ResponsiveStyleValue<AlignItems | AlignItems[] | undefined>
    | ((
        theme: Theme,
      ) => ResponsiveStyleValue<AlignItems | AlignItems[] | undefined>);
}
