import React, { FC, MouseEvent } from 'react';

import { STagButton } from '../../atoms/STagButton';
import { SMenu } from '../SMenu';
import { IMenuSearchOption } from '../SMenuSearch/types';
import { IAnchorEvent, ISTagSelectProps } from './types';

export const STagSelect: FC<ISTagSelectProps> = ({
  options,
  text,
  large,
  icon,
  onClick,
  handleSelectMenu,
  menuRef,
  ...props
}) => {
  const [anchorEl, setAnchorEl] = React.useState<IAnchorEvent>(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectTag = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    onClick && onClick(e);
  };

  const handleSelect = (
    option: IMenuSearchOption,
    e: MouseEvent<HTMLLIElement>,
  ) => {
    e.stopPropagation();
    handleSelectMenu && handleSelectMenu(option, e);
  };

  return (
    <>
      <STagButton
        ref={menuRef}
        large={large}
        onClick={handleSelectTag}
        icon={icon}
        text={text}
        {...props}
      />
      <SMenu
        close={handleClose}
        isOpen={Boolean(anchorEl)}
        anchorEl={anchorEl}
        handleSelect={handleSelect}
        icon={icon}
        options={options}
      />
    </>
  );
};
