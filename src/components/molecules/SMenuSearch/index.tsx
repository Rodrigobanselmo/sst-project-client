import { FC, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Box, CircularProgress, Icon, LinearProgress } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import diacritics from 'diacritics';
import Fuse from 'fuse.js';
import { useDebouncedCallback } from 'use-debounce';

import { IdsEnum } from 'core/enums/ids.enums';

import { resolveFuseSearchQuery } from './resolve-fuse-search-query';
import {
  applyLockedSelectedState,
  sortByOptionOrder,
} from './apply-locked-selected-state.util';
import { SMenuSearchItems } from './SMenuSearchItems';
import { STMenu, STSInput } from './styles';
import { IMenuSearchOption, SMenuSearchProps } from './types';

export const SMenuSearch: FC<{ children?: any } & SMenuSearchProps> = ({
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
  lockSelected,
  preserveOptionOrder,
  additionalButton,
  confirmSelectionOnClose = true,
  renderFilter,
  listMaxHeight = 350,
  onEnter,
  onSearch,
  asyncLoad,
  isLoading,
  handleMultiSelectMenu,
  renderContent,
  transformSearch,
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

  const resetAndClose = () => {
    setSearch('');
    close();
    localSelected.current = [] as any;
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const commitSelection = (e: any) => {
    e?.stopPropagation?.();
    handleSelect(localSelected.current, e);
    resetAndClose();
  };

  const onClose = (e: any) => {
    e?.stopPropagation?.();
    if (multiple && confirmSelectionOnClose === false) {
      resetAndClose();
      return;
    }
    handleSelect(localSelected.current, e);
    resetAndClose();
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
    return applyLockedSelectedState(options, selected, valueField, {
      lockSelected,
      preserveOptionOrder,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, selected, lockSelected, preserveOptionOrder, valueField]);

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

  const fuseQuery = resolveFuseSearchQuery(search, transformSearch);
  const fuseResults = asyncLoad
    ? null
    : fuse.search(diacritics.remove(fuseQuery), { limit: 20 + 40 * scroll });
  const searched = asyncLoad
    ? optionsMemoized
    : search
      ? fuseResults.map((result: any) => result.item)
      : optionsMemoized
          .filter((option) => !(option?.hideWithoutSearch && !option?.checked))
          .slice(0, 20 + 200 * scroll);
  const results = search
    ? preserveOptionOrder
      ? sortByOptionOrder(searched, optionsMemoized, valueField)
      : applyLockedSelectedState(searched, selected, valueField, {
          lockSelected,
        })
    : searched;

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
          pb: renderFilter ? 2 : 0,
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
      {isLoading && <LinearProgress />}
      {!results.length && !isLoading && (
        <>
          {!additionalButton && (
            <SFlex
              center
              sx={{ fontSize: '0.85rem', color: 'text.light', py: 8 }}
            >
              nenhum resultado encontrado
            </SFlex>
          )}
          {additionalButton && (
            <SFlex
              sx={{ fontSize: '0.85rem', color: 'text.light', p: 5 }}
              gap={8}
            >
              <STagButton
                text="Adicionar"
                active
                bg="success.main"
                onClick={(e) => additionalButton(e as any)}
              />
              Nenhuma opção
            </SFlex>
          )}
        </>
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
        sx={{ maxHeight: listMaxHeight, overflow: 'auto' }}
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
          preserveOptionOrder={preserveOptionOrder}
          defaultChecked
          listRef={listWrapperRef}
          handleMultiSelectMenu={handleMultiSelectMenu}
          setScroll={setScroll}
          renderContent={renderContent}
        />
        {additionalButton && (
          <SIconButton
            bg="success.dark"
            onClick={additionalButton}
            sx={{
              position: 'absolute',
              top: renderFilter
                ? '18px'
                : results.length === 0
                  ? '10px'
                  : '10px',
              bottom: renderFilter ? 10 : '',
              right: results.length === 0 ? '10px' : '10px',
              height: '30px',
              width: '30px',
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
      {multiple && (
        <STagButton large text={'CONFIRMAR'} onClick={commitSelection} />
      )}
    </STMenu>
  );
};
