import { FC, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Box, Icon } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import Fuse from 'fuse.js';
import { useDebouncedCallback } from 'use-debounce';

import { SMenuSearchItems } from './SMenuSearchItems';
import { STMenu, STSInput } from './styles';
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
  multiple,
  selected,
  additionalButton,
  renderFilter,
  ...props
}) => {
  const [search, setSearch] = useState<string>('');
  const [scroll, setScroll] = useState(0);

  const localSelected = useRef<string[]>([]);
  const listWrapperRef = useRef<HTMLDivElement>(null);

  const handleMenuSelect = (
    option: IMenuSearchOption,
    e: MouseEvent<HTMLLIElement>,
  ) => {
    if (isOpen && !multiple) close();
    if (!multiple) handleSelect(option, e);
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const onClose = (e: any) => {
    e.stopPropagation();
    handleSelect(localSelected.current, e);
    setSearch('');
    close();
    localSelected.current = [];
  };

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setScroll(0);
    setSearch(value);
    if (listWrapperRef.current) listWrapperRef.current.scrollTop = 0;
  }, 300);

  useEffect(() => {
    setScroll(0);
  }, [isOpen]);

  useEffect(() => {
    if (selected) localSelected.current = [...selected];
  }, [isOpen, selected]);

  const valueField =
    (optionsFieldName && optionsFieldName?.valueField) ?? 'value';

  const optionsMemoized = useMemo(() => {
    if (!selected) return options;

    const selectedResult = options
      .filter((option) => selected.includes(option[valueField]))
      .map((select) => ({ ...select, checked: true }));

    const optionsResult = options.filter(
      (option) => !selected.includes(option[valueField]),
    );

    return [...selectedResult, ...optionsResult];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, selected]);

  const fuse = new Fuse(optionsMemoized, { keys, ignoreLocation: true });

  const numberOfRows = 20 + 200 * scroll;

  const fuseResults = fuse.search(search, { limit: 20 });
  const results = search
    ? fuseResults.map((result) => result.item)
    : optionsMemoized.slice(0, 20 + 200 * scroll);

  return (
    <STMenu
      anchorEl={anchorEl}
      open={isOpen}
      onClose={(e) => onClose(e)}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      <Box
        sx={{
          borderBottom: '1px solid',
          borderColor: 'background.divider',
          pb: renderFilter ? 4 : 0,
        }}
      >
        <STSInput
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={placeholder}
          variant="standard"
          sx={{ width: '100%', minWidth: width }}
          unstyled
          autoFocus
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
        />
        {renderFilter && renderFilter()}
      </Box>
      <Box
        ref={listWrapperRef}
        onScroll={(e) => {
          console.log(optionsMemoized.length, numberOfRows);
          const target = e.target as any;
          if (
            target.scrollHeight - target.clientHeight == target.scrollTop &&
            optionsMemoized.length > numberOfRows
          )
            setScroll((scroll) => scroll + 1);
        }}
        sx={{ maxHeight: 350, overflow: 'auto' }}
      >
        <SMenuSearchItems
          options={results}
          optionsFieldName={optionsFieldName}
          handleMenuSelect={handleMenuSelect}
          startAdornment={startAdornment}
          icon={icon}
          localSelected={localSelected}
          multiple={multiple}
          defaultChecked
        />
        {additionalButton && (
          <SIconButton
            bg="primary.light"
            onClick={additionalButton}
            sx={{
              position: 'absolute',
              top: renderFilter ? '' : results.length === 0 ? '-5px' : '12px',
              bottom: renderFilter ? 10 : '',
              right: results.length === 0 ? '20px' : '28px',
              height: '35px',
              width: '35px',
            }}
          >
            <Icon
              component={AddIcon}
              sx={{
                fontSize: ['1.7rem'],
                color: 'common.white',
              }}
            />
          </SIconButton>
        )}
      </Box>
    </STMenu>
  );
};
