import React, { FC } from 'react';

import CircleTwoToneIcon from '@mui/icons-material/CircleTwoTone';
import { STagSelect } from 'components/molecules/STagSelect';

import { paragraphOptionsConstant } from 'core/constants/maps/paragraph-options.constant';

import { IParagraphSelectProps } from './types';

export const ParagraphSelect: FC<
  { children?: any } & IParagraphSelectProps
> = ({ selected, paragraphOptions, ...props }) => {
  return (
    <STagSelect
      options={paragraphOptions.map((key) => ({
        ...paragraphOptionsConstant[key],
      }))}
      tooltipTitle={paragraphOptionsConstant?.[selected]?.name}
      text={paragraphOptionsConstant?.[selected]?.name}
      // large={false}
      icon={CircleTwoToneIcon}
      large
      iconProps={{
        sx: {
          fontSize: '15px',
          color: 'warning.main',
        },
      }}
      {...props}
    />
  );
};
