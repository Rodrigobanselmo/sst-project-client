import { PopperSelectAsync, PopperSelectAsyncProps } from './PopperSelectAsync';
import {
  PopperSelectMemorized,
  PopperSelectMemorizedProps,
} from './PopperSelectMemorized';

export type PopperSelectProps<Value> =
  | PopperSelectMemorizedProps<Value>
  | PopperSelectAsyncProps<Value>;

export function PopperSelect<T>(props: PopperSelectProps<T>) {
  if ('onSearchFunc' in props && !!props.onSearchFunc) {
    return <PopperSelectAsync {...props} />;
  }

  return <PopperSelectMemorized {...props} />;
}
