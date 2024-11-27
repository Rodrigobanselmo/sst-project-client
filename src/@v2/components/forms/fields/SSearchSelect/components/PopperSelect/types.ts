import { PopperSelectBaseProps } from './components/PopperSelectComponent';

export interface PopperSelectSingleProps<Value> {
  options: Value[];
  onChange: (value: Value, event: React.SyntheticEvent) => void;
}

export interface PopperManySingleProps<Value> {
  options: Value[];
  onChange: (value: Value, event: React.SyntheticEvent) => void;
}

export type PopperSelectProps<Value> = PopperSelectBaseProps<Value> &
  (PopperSelectSingleProps<Value> | PopperManySingleProps<Value>);
