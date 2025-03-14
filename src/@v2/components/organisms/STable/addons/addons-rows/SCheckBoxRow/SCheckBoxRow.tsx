import { SIconCheckBox } from '@v2/assets/icons/SIconCheckBox/SIconCheckBox';
import { SIconEmptyCheckBox } from '@v2/assets/icons/SIconEmptyCheckBox/SIconEmptyCheckBox';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { FC } from 'react';
import { SCheckBoxRowProps } from './SCheckBoxRow.types';

export const SCheckBoxRow: FC<SCheckBoxRowProps> = ({
  disabled,
  children,
  iconButtonProps,
  checked,
  ...props
}) => (
  <SFlex center onClick={(e) => e.stopPropagation()}>
    <SIconButton {...props}>
      {checked ? (
        <SIconCheckBox color="success.main" />
      ) : (
        <SIconEmptyCheckBox />
      )}
    </SIconButton>
  </SFlex>
);
