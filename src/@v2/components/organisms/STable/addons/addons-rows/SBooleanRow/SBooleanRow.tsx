import { SIconCheckBox } from '@v2/assets/icons/SIconCheckBox/SIconCheckBox';
import { SIconEmptyCheckBox } from '@v2/assets/icons/SIconEmptyCheckBox/SIconEmptyCheckBox';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { FC } from 'react';
import { SBooleanRowProps } from './SBooleanRow.types';

export const SBooleanRow: FC<SBooleanRowProps> = ({ checked }) => (
  <SFlex center onClick={(e) => e.stopPropagation()}>
    {checked ? <SIconCheckBox color="success.main" /> : <SIconEmptyCheckBox />}
  </SFlex>
);
