import { FC, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import diacritics from 'diacritics';
import Fuse from 'fuse.js';
import { useDebouncedCallback } from 'use-debounce';

import { IdsEnum } from 'core/enums/ids.enums';

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
  endAdornment,
  width = 500,
  multiple,
  selected,
  additionalButton,
  renderFilter,
  onEnter,
  onSearch,
  asyncLoad,
  ...props
}) => {
  const [search, setSearch] = useState<string>('');
  const [scroll, setScroll] = useState(0);

  const localSelected = useRef<(string | number)[]>([]);
  const listWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onSearch && onSearch(search);
  }, [onSearch, search]);

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

  function removeAccents(obj: any) {
    if (typeof obj === 'string' || obj instanceof String) {
      return obj.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    return obj;
  }

  const getFn = (obj: any, path: any) => {
    const value = Fuse.config.getFn(obj, path);
    if (Array.isArray(value)) {
      return value.map((el) => removeAccents(el));
    }
    return removeAccents(value);
  };

  const fuse = asyncLoad
    ? ({} as any)
    : new Fuse(optionsMemoized, {
        keys,
        getFn,
        ignoreLocation: true,
      });

  const numberOfRows = 20 + 200 * scroll;

  const fuseResults = asyncLoad
    ? null
    : fuse.search(diacritics.remove(search), { limit: 20 });
  const results = asyncLoad
    ? optionsMemoized
    : search
    ? fuseResults.map((result: any) => result.item)
    : optionsMemoized
        .filter((option) => !(option?.hideWithoutSearch && !option?.checked))
        .slice(0, 20 + 200 * scroll);

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
        <span
          id={IdsEnum.MENU_CLOSE}
          style={{ display: 'none' }}
          onClick={(e) => onClose(e)}
        />
        <STSInput
          inputProps={{ id: IdsEnum.INPUT_MENU_SEARCH, tabIndex: -1 }}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={placeholder}
          sx={{ width: '100%', minWidth: width }}
          firstLetterCapitalize
          unstyled
          autoFocus
          onKeyDown={(e) => {
            const target = e.target as unknown as { value: string };
            if (e.key === 'Enter') if (onEnter) onEnter(target.value);
            if (e.key === 'ArrowDown') {
              const listItem = document.getElementById(
                IdsEnum.MENU_ITEM_ID.replace(':id', '0'),
              );
              if (listItem) {
                listItem.focus();
                if (listWrapperRef.current?.style)
                  (listWrapperRef.current.style.overflowY as any) = 'hidden';
                setTimeout(() => {
                  if (listWrapperRef.current?.style)
                    (listWrapperRef.current.style.overflowY as any) = 'auto';
                }, 100);
                e.stopPropagation();
              }
            }
            if (e.key === 'ArrowUp') {
              e.stopPropagation();
            }
          }}
        />
        {renderFilter && renderFilter()}
      </Box>
      {!results.length && (
        <SFlex center sx={{ fontSize: '0.85rem', color: 'text.light', py: 8 }}>
          nenhum resultado encontrado
        </SFlex>
      )}

      <Box
        ref={listWrapperRef}
        onScroll={(e) => {
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
          endAdornment={endAdornment}
          icon={icon}
          localSelected={localSelected}
          multiple={multiple}
          defaultChecked
          listRef={listWrapperRef}
          setScroll={setScroll}
        />
        {additionalButton && (
          <SIconButton
            bg="primary.light"
            onClick={additionalButton}
            sx={{
              position: 'absolute',
              top: renderFilter ? '18px' : results.length === 0 ? '5px' : '5px',
              bottom: renderFilter ? 10 : '',
              right: results.length === 0 ? '10px' : '10px',
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
