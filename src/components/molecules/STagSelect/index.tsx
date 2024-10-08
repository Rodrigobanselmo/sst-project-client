import React, { FC, MouseEvent } from 'react';

import STooltip from 'components/atoms/STooltip';

import { STagButton } from '../../atoms/STagButton';
import { SMenu } from '../SMenu';
import { IMenuSearchOption } from '../SMenuSearch/types';
import { IAnchorEvent, ISTagSelectProps } from './types';

export const STagSelect: FC<{ children?: any } & ISTagSelectProps> = ({
  options,
  text,
  large,
  icon,
  iconMenu,
  onClick,
  handleSelectMenu,
  menuRef,
  tooltipTitle,
  startAdornment,
  tooltipProps,
  disabled,
  ...props
}) => {
  const [anchorEl, setAnchorEl] = React.useState<IAnchorEvent>(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectTag = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

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
      <STooltip withWrapper title={tooltipTitle}>
        <STagButton
          ref={menuRef}
          large={large}
          onClick={handleSelectTag}
          icon={icon}
          text={text}
          {...props}
        />
      </STooltip>
      <SMenu
        close={handleClose}
        startAdornment={startAdornment}
        isOpen={Boolean(anchorEl)}
        anchorEl={anchorEl}
        handleSelect={handleSelect}
        icon={iconMenu ?? icon}
        tooltipProps={tooltipProps}
        options={options}
      />
    </>
  );
};
