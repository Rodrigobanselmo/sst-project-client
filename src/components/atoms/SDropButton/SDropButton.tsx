import { FC, MouseEvent, useState } from 'react';

import { Box, Icon } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import { SMenu } from 'components/molecules/SMenu';
import { IMenuSearchOption } from 'components/molecules/SMenuSearch/types';
import { IAnchorEvent } from 'components/molecules/STagSelect/types';

import { ISDropButton } from './types';

export const SDropButton: FC<{ children?: any } & ISDropButton> = ({
  onSelect,
  options,
  text,
  loading,
  iconButton,
  icon,
}) => {
  const [anchorEl, setAnchorEl] = useState<IAnchorEvent>(null);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = async (
    option: IMenuSearchOption,
    e: MouseEvent<HTMLLIElement>,
  ) => {
    e.stopPropagation();
    onSelect(option, e);
  };

  const handleSelectButton = (e: any) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  return (
    <Box>
      {!iconButton && (
        <STagButton
          icon={icon}
          text={text}
          onClick={handleSelectButton}
          loading={loading}
        />
      )}
      {iconButton && (
        <SIconButton
          tooltip={text}
          sx={{ width: 36, height: 36 }}
          onClick={handleSelectButton}
          loading={loading}
        >
          <Icon component={icon} />
        </SIconButton>
      )}
      <SMenu
        close={handleClose}
        isOpen={Boolean(anchorEl)}
        anchorEl={anchorEl}
        handleSelect={handleSelect}
        options={options}
      />
    </Box>
  );
};
