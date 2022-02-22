/* eslint-disable @typescript-eslint/ban-types */
import { SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';

export interface IIconMuiProps
  extends OverridableComponent<SvgIconTypeMap<{}, 'svg'>> {
  muiName: string;
}
