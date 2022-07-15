import React, { FC, MouseEvent } from 'react';

import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import { STagButton } from '../../atoms/STagButton';
import { SMenuSearch } from '../SMenuSearch';
import { IMenuSearchOption } from '../SMenuSearch/types';
import { IAnchorEvent, ISTagSearchSelectProps } from './types';

export const STagSearchSelect: FC<ISTagSearchSelectProps> = ({
  options,
  text,
  large,
  icon,
  iconItem,
  onClick,
  handleSelectMenu,
  startAdornment,
  optionsFieldName,
  placeholder,
  multiple,
  selected,
  keys = ['name'],
  renderFilter,
  additionalButton,
  tooltipTitle,
  endAdornment,
  error,
  onEnter,
  onSearch,
  asyncLoad,
  onClose,
  isLoading,
  handleMultiSelectMenu,
  preventOpen,
  ...props
}) => {
  const [anchorEl, setAnchorEl] = React.useState<IAnchorEvent>(null);

  const handleClose = () => {
    setAnchorEl(null);
    onClose && onClose();
  };

  const handleSelectTag = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!preventOpen) setAnchorEl(e.currentTarget);
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
      <div>
        <STooltip withWrapper title={tooltipTitle}>
          <STagButton
            maxWidth={'300px'}
            large={large}
            onClick={handleSelectTag}
            icon={icon}
            text={text}
            error={error}
            {...props}
          />
        </STooltip>
        {error && (
          <SText
            sx={{ fontSize: 10, color: 'error.main', ml: 5, mt: '0.3rem' }}
          >
            Campo obrigatório
          </SText>
        )}
      </div>
      <SMenuSearch
        isLoading={isLoading}
        asyncLoad={asyncLoad}
        close={handleClose}
        isOpen={Boolean(anchorEl)}
        anchorEl={anchorEl}
        handleSelect={handleSelect}
        icon={iconItem}
        options={options}
        startAdornment={startAdornment}
        endAdornment={endAdornment}
        optionsFieldName={optionsFieldName}
        placeholder={placeholder}
        multiple={multiple}
        selected={selected}
        keys={keys}
        additionalButton={additionalButton}
        renderFilter={renderFilter}
        onEnter={onEnter}
        onSearch={onSearch}
        handleMultiSelectMenu={handleMultiSelectMenu}
      />
    </>
  );
};
