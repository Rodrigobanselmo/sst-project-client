import React, { FC, MouseEvent } from 'react';

import { STagButton } from '../../atoms/STagButton';
import { SMenuSearch } from '../SMenuSearch';
import { IMenuSearchOption } from '../SMenuSearch/types';
import { IAnchorEvent, ISTagSearchSelectProps } from './types';

export const STagSearchSelect: FC<ISTagSearchSelectProps> = ({
  options,
  text,
  large,
  icon,
  onClick,
  handleSelectMenu,
  startAdornment,
  optionsFieldName,
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
        large={large}
        onClick={handleSelectTag}
        icon={icon}
        text={text}
        {...props}
      />
      <SMenuSearch
        close={handleClose}
        isOpen={Boolean(anchorEl)}
        anchorEl={anchorEl}
        handleSelect={handleSelect}
        icon={icon}
        options={options}
        startAdornment={startAdornment}
        optionsFieldName={optionsFieldName}
      />
    </>
  );
};