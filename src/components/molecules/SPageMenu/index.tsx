import { FC } from 'react';

import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';

import { SPageMenuProps } from './types';

export const SPageMenu: FC<SPageMenuProps> = ({
  options,
  active,
  onChange,
  ...props
}) => {
  return (
    <SFlex gap={5} {...props}>
      {options.map((options) => (
        <STagButton
          active={active === options.value}
          large
          key={options.value}
          onClick={(e) => onChange(options.value, e)}
          text={options.label}
        />
      ))}
    </SFlex>
  );
};
