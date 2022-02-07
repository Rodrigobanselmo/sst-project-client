import { FC, MouseEvent, useState } from 'react';

import { Box } from '@mui/material';
import Icon from '@mui/material/Icon';
import Fuse from 'fuse.js';
import { useDebouncedCallback } from 'use-debounce';

import SText from '../../atoms/SText';
import { STMenu, STMenuItem, STSInput } from './styles';
import { IMenuSearchOption, SMenuSearchProps } from './types';

export const SMenuSearch: FC<SMenuSearchProps> = ({
  isOpen,
  close,
  anchorEl,
  handleSelect,
  options,
  icon,
  keys = ['name'],
  placeholder = 'Pesquisa ...',
  optionsFieldName,
  startAdornment,
  width = 500,
  ...props
}) => {
  const [search, setSearch] = useState<string>('');

  const fuse = new Fuse(options, { keys });

  const handleMenuSelect = (
    option: IMenuSearchOption,
    e: MouseEvent<HTMLLIElement>,
  ) => {
    if (isOpen) close();
    handleSelect(option, e);
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const onClose = (e: any) => {
    e.stopPropagation();
    close();
  };

  const handleSearchChange = useDebouncedCallback(
    (value: string) => setSearch(value),
    300,
  );

  const fuseResults = fuse.search(search, { limit: 20 });
  const results = search
    ? fuseResults.map((result) => result.item)
    : options.slice(0, 20000);

  const valueField =
    (optionsFieldName && optionsFieldName?.valueField) ?? 'value';
  const contentField =
    (optionsFieldName && optionsFieldName?.contentField) ?? 'name';

  return (
    <STMenu
      anchorEl={anchorEl}
      open={isOpen}
      onClose={(e) => onClose(e)}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      <STSInput
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder={placeholder}
        variant="standard"
        sx={{ width: '100%', minWidth: width }}
        unstyled
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
      />
      <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
        {results.map((option) => {
          const value = option[valueField];
          const content = option[contentField];
          const optionIcon = option?.icon ? option.icon : icon;

          return (
            <STMenuItem
              key={value}
              onClick={(e) => handleMenuSelect(option, e)}
            >
              {optionIcon && <Icon component={optionIcon} />}
              {!optionIcon && startAdornment && startAdornment(option)}
              <SText fontSize={13} lineNumber={2} sx={{ ml: 10 }}>
                {content}
              </SText>
            </STMenuItem>
          );
        })}
      </Box>
    </STMenu>
  );
};
