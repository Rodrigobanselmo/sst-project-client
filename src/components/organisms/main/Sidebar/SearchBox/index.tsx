import { KeyboardEvent, useRef } from 'react';
import { RiCloseCircleLine, RiSearchLine } from 'react-icons/ri';

import { Icon } from '@mui/material';

import { useSidebarDrawer } from '../../../../../core/contexts/SidebarContext';
import { SInput } from '../../../../atoms/SInput';
import { SIDEBAR_SEARCH_LISTBOX_ID } from './sidebar-search.util';

type SearchBoxProps = {
  expanded?: boolean;
  activeOptionId?: string;
  onSearchKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
};

export function SearchBox({
  expanded = false,
  activeOptionId,
  onSearchKeyDown,
}: SearchBoxProps): JSX.Element {
  const { isOpen, open, setIsSearching, searchQuery, setSearchQuery } =
    useSidebarDrawer();
  const searchInputRef = useRef<HTMLInputElement>(null);

  function onClean() {
    setSearchQuery('');
    searchInputRef.current?.focus();
  }

  function onSearchButton() {
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    open();
  }

  return (
    <SInput
      placeholder="Pesquisar..."
      inputProps={{
        'aria-label': 'Pesquisar funcionalidades ou empresas',
        role: 'combobox',
        'aria-expanded': expanded,
        'aria-controls': SIDEBAR_SEARCH_LISTBOX_ID,
        'aria-autocomplete': 'list',
        'aria-activedescendant': expanded ? activeOptionId : undefined,
      }}
      onChange={(e) => setSearchQuery(e.target.value)}
      inputRef={searchInputRef}
      sx={{
        fontSize: 10,
        '& .MuiOutlinedInput-root': {
          fontSize: '0.9rem',
          backgroundColor: 'background.paper',
          color: 'text.main',
          maxHeight: '2.2rem',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'background.divider',
        },
        width: '100%',
      }}
      size="small"
      onFocus={() => setIsSearching(true)}
      onBlur={() => setIsSearching(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          setSearchQuery('');
          return;
        }
        onSearchKeyDown?.(e);
      }}
      value={searchQuery}
      startAdornment={
        <Icon
          onClick={onSearchButton}
          component={RiSearchLine}
          sx={{
            transition: 'margin 0.8s ease',
            alignSelf: 'center',
            fontSize: '15px',
            color: 'text.medium',
            ml: isOpen ? 0 : '-5px',
            cursor: 'pointer',
          }}
        />
      }
      endAdornment={
        isOpen && searchQuery ? (
          <Icon
            onClick={onClean}
            component={RiCloseCircleLine}
            sx={{
              alignSelf: 'center',
              fontSize: '20px',
              color: 'text.medium',
              ml: -2,
              cursor: 'pointer',
            }}
          />
        ) : null
      }
    />
  );
}
