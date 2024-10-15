import { Divider } from '@mui/material';
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem';

export interface CMenuItemProps extends MenuItemProps {}

export const SelectMenuItem = ({ ...props }: CMenuItemProps) => {
  return (
    <>
      <MenuItem
        {...props}
        sx={{
          fontSize: '14px',
          minWidth: '180px',
          lineHeight: '140%',
          '@media (max-width: 960px)': {
            fontSize: '12px',
          },
          fontWeight: 400,
          // borderBottom: props.haveDivider ? '1px solid #e0e0e0' : 'none',
          paddingX: 2,
          paddingY: 1,
          ...props.sx,
        }}
      />
    </>
  );
};
